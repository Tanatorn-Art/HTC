'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { PiFileMagnifyingGlassBold } from 'react-icons/pi';
// Import HierarchicalDepartment type from your types file
import { HierarchicalDepartment as RawDepartmentData } from '@/app/types'; // <--- IMPORT HERE

// Changed Employee type to reflect the actual API response type HierarchicalDepartment
// We use a different name "RawDepartmentData" for clarity to distinguish it from the aggregated type
export type Employee = RawDepartmentData; 

type ManpowerTableProps = {
  selectedDate: string;
  scanStatus: string;
};

type AggregatedDepartment = {
  deptcode: string;
  deptname: string; // This will hold the extracted simple department name (e.g., "IT")
  totalScanned: number; // Changed to number to match internal calculations
  totalNotScanned: number; // Changed to number to match internal calculations
  totalPerson: number; // Changed to number to match internal calculations
  level: number; // This will hold the 'min_level' value from API
};

const INITIAL_LOAD_LIMIT = 20;
const LOAD_MORE_STEP = 20;

export function ManpowerTable({ selectedDate, scanStatus }: ManpowerTableProps) {
  // Use RawDepartmentData for the state that holds raw API response
  const [employees, setEmployees] = useState<RawDepartmentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(INITIAL_LOAD_LIMIT);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      setLimit(INITIAL_LOAD_LIMIT);
      try {
        const response = await fetch(`/api/department?date=${selectedDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        // Cast data to RawDepartmentData[] to match the state type
        const data: RawDepartmentData[] = await response.json(); 
        console.log("1. Raw API Data received (employees state):", data); // DEBUG LOG
        setEmployees(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [selectedDate]);

  // Helper function to extract the simple department name from hierarchy
  const getSimpleDeptName = (hierarchy: string | null | undefined): string => {
    if (!hierarchy || typeof hierarchy !== 'string') {
      console.log("getSimpleDeptName: Invalid or empty hierarchy input:", hierarchy); // DEBUG LOG
      return '';
    }
    const trimmedHierarchy = hierarchy.trim();
    const parts = trimmedHierarchy.split(' → ');
    const simpleName = parts[parts.length - 1].trim();
    console.log("getSimpleDeptName: Input:", hierarchy, "| Output:", simpleName); // DEBUG LOG
    return simpleName;
  };

  const aggregatedDepartments = useMemo<AggregatedDepartment[]>(() => {
    const departmentMap = new Map<string, AggregatedDepartment>();

    if (employees && employees.length > 0) {
      employees.forEach(emp => { // emp is now RawDepartmentData type
        let currentDept = departmentMap.get(emp.deptcode);
        
        const simpleDeptName = getSimpleDeptName(emp.hierarchy);

        if (!currentDept) {
          currentDept = {
            deptcode: emp.deptcode,
            deptname: simpleDeptName,
            totalScanned: Number(emp.countscan), // Convert to Number here
            totalNotScanned: Number(emp.countnotscan), // Convert to Number here
            totalPerson: Number(emp.countperson), // Convert to Number here
            level: emp.min_level, // <--- Use emp.min_level from HierarchicalDepartment
          };
          departmentMap.set(emp.deptcode, currentDept);
        } else {
          if (!currentDept.deptname && simpleDeptName) {
              currentDept.deptname = simpleDeptName;
          }
          // Ensure level is set, using min_level
          if (currentDept.level === undefined || currentDept.level === null) {
              currentDept.level = emp.min_level; // <--- Use emp.min_level
          }
          // Aggregate counts, ensuring they are numbers
          currentDept.totalScanned += Number(emp.countscan);
          currentDept.totalNotScanned += Number(emp.countnotscan);
          currentDept.totalPerson += Number(emp.countperson);
        }
      });
    }

    const result = Array.from(departmentMap.values()).sort((a, b) => {
        if (a.deptcode < b.deptcode) return -1;
        if (a.deptcode > b.deptcode) return 1;
        return a.level - b.level; // Sort by level
    });
    console.log("2. Aggregated Departments (after processing & sorting):", result.map(d => ({ deptcode: d.deptcode, deptname: d.deptname, level: d.level, totalScanned: d.totalScanned, totalNotScanned: d.totalNotScanned, totalPerson: d.totalPerson }))); // DEBUG LOG
    return result;
  }, [employees]);

  const filteredDepartments = useMemo(() => {
    let departments = aggregatedDepartments;
    if (scanStatus === 'scanned') {
      departments = departments.filter(dept => dept.totalScanned > 0);
    }
    if (scanStatus === 'not_scanned') {
      departments = departments.filter(dept => dept.totalNotScanned > 0);
    }
    console.log("3. Filtered Departments (after scanStatus filter):", departments.map(d => ({ deptcode: d.deptcode, deptname: d.deptname, totalScanned: d.totalScanned, totalNotScanned: d.totalNotScanned }))); // DEBUG LOG
    return departments;
  }, [aggregatedDepartments, scanStatus]);

  const departmentsToDisplay = useMemo(() => {
    const slicedDeps = filteredDepartments.slice(0, limit);
    console.log("4. Departments to Display (sliced for limit):", slicedDeps.map(d => ({ deptcode: d.deptcode, deptname: d.deptname, level: d.level, totalPerson: d.totalPerson }))); // DEBUG LOG
    return slicedDeps;
  }, [filteredDepartments, limit]);

  const loadMoreItems = useCallback(() => {
    setLimit(prevLimit => prevLimit + LOAD_MORE_STEP);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && limit < filteredDepartments.length) {
          loadMoreItems();
        }
      },
      { threshold: 1.0 }
    );

    const currentObserverTarget = observerTarget.current;

    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [limit, filteredDepartments.length, loadMoreItems]);

  useEffect(() => {
    setLimit(INITIAL_LOAD_LIMIT);
  }, [selectedDate, scanStatus]);


  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const getPaddingClass = (level: number) => {
      const paddingUnit = 6;
      const calculatedPadding = (level + 1) * paddingUnit;
      return `pl-${calculatedPadding}`;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      {filteredDepartments.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          ไม่พบข้อมูลสำหรับวันที่หรือเงื่อนไขการสแกนที่เลือก
        </div>
      ) : (
        <>
          <table className="min-w-full text-sm border-collapse">
            <thead className="border-b text-gray-600">
              <tr>
                <th className="py-2 px-6 text-left">DEPARTMENT / SUB-DEPARTMENT</th>
                {scanStatus !== 'not_scanned' && (<th className="py-2 px-6 text-right">SCANNED IN</th>)}
                {scanStatus !== 'scanned' && (<th className="py-2 px-6 text-right">NOT SCANNED IN</th>)}
                <th className="py-2 px-6 text-right">TOTAL EMPLOYEES</th>
                <th className="p-0">ดูรายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {departmentsToDisplay.map((dept) => {
                const linkDeptcode = dept.deptcode;
                const linkWorkdate = selectedDate;

                const handleLinkClick = () => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('prevDashboardDate', selectedDate);
                  }
                };

                return (
                  <tr key={dept.deptcode} className="border-b border-gray-100 last:border-b-0">
                    <td className={`py-2 px-6 ${getPaddingClass(dept.level)}`}>{dept.deptname}</td>
                    {scanStatus !== 'not_scanned' && (<td className="py-2 px-6 text-right">{dept.totalScanned}</td>)}
                    {scanStatus !== 'scanned' && (<td className="py-2 px-6 text-right">{dept.totalNotScanned}</td>)}
                    <td className="py-2 px-6 text-right">{dept.totalPerson}</td>
                    <td className="p-3">
                      <Link href={`/report/${linkDeptcode}?workdate=${linkWorkdate}`} onClick={handleLinkClick}>
                        <PiFileMagnifyingGlassBold size={30} className="text-blue-500 hover:text-blue-700" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {/* Example summary row */}
              {departmentsToDisplay.length > 0 && departmentsToDisplay.some(dept => dept.deptname && typeof dept.deptname === 'string' && dept.deptname.startsWith('President')) && (
                <tr className="border-b border-gray-100 font-semibold bg-gray-50">
                  <td className="py-2 px-6 pl-8">Total for President & P&O:</td>
                  <td className="py-2 px-6 text-right">{/* Placeholder for actual calculated sum */}</td>
                  <td className="py-2 px-6 text-right">{/* Placeholder for actual calculated sum */}</td>
                  <td className="py-2 px-6 text-right">{/* Placeholder for actual calculated sum */}</td>
                  <td className="p-3"></td>
                </tr>
              )}
            </tbody>
          </table>

          {limit < filteredDepartments.length && (
            <div ref={observerTarget} className="flex justify-center mt-4 p-2 text-gray-500">
              กำลังโหลด...
            </div>
          )}
          {limit >= filteredDepartments.length && filteredDepartments.length > INITIAL_LOAD_LIMIT && (
            <div className="text-center py-2 text-gray-500">
              แสดงข้อมูลครบถ้วนแล้ว
            </div>
          )}
        </>
      )}
    </div>
  );
}