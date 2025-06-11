'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PiFileMagnifyingGlassBold } from 'react-icons/pi';
import Spinner from './ui/Spinner'; 

export type Employee = {
  deptcode: string;
  deptname: string;
  deptsbu: string;
  deptstd: string;
  countscan: string; 
  countnotscan: string; 
  countperson: string; 
  workdate: string;
  deptcodelevel1: string; 
  deptcodelevel2: string;
  deptcodelevel3: string;
  deptcodelevel4: string;
  parentcode: string | null;
  PersonType: string | null;
  PersonGroup: string | null;
};

type ManpowerTableProps = {
  selectedDate: string;
  scanStatus: string;
  deptcodelevel1Filter?: string; 
};

type AggregatedDepartment = {
  deptcode: string;
  deptname: string;
  deptsbu: string;
  deptstd: string;
  totalScanned: number;
  totalNotScanned: number;
  totalPerson: number;
};

export function ManpowerTable({ selectedDate, scanStatus, deptcodelevel1Filter }: ManpowerTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/department?date=${selectedDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data: Employee[] = await response.json();
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

  const aggregatedDepartments = useMemo<AggregatedDepartment[]>(() => {
    const departmentMap = new Map<string, AggregatedDepartment>();

    employees.forEach(emp => {
      if (deptcodelevel1Filter && emp.deptcodelevel1 !== deptcodelevel1Filter) {
        return; 
      }

      let currentDept = departmentMap.get(emp.deptcode);
      if (!currentDept) {
        currentDept = {
          deptcode: emp.deptcode,
          deptname: emp.deptname,
          deptsbu: emp.deptsbu,
          deptstd: emp.deptstd,
          totalScanned: 0,
          totalNotScanned: 0,
          totalPerson: 0,
        };
        departmentMap.set(emp.deptcode, currentDept);
      }

      currentDept.totalScanned += Number(emp.countscan);
      currentDept.totalNotScanned += Number(emp.countnotscan);
      currentDept.totalPerson += Number(emp.countperson);
    });

    return Array.from(departmentMap.values());
  }, [employees, deptcodelevel1Filter]); 

  const filteredDepartments = useMemo(() => {
    if (scanStatus === 'scanned') {
      return aggregatedDepartments.filter(dept => dept.totalScanned > 0);
    }
    if (scanStatus === 'not_scanned') {
      return aggregatedDepartments.filter(dept => dept.totalNotScanned > 0);
    }
    return aggregatedDepartments;
  }, [aggregatedDepartments, scanStatus]);


  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (filteredDepartments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        ไม่พบข้อมูลสำหรับโรงงานนี้
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-2 px-6">รหัสแผนก</th>
            <th className="py-2 px-6">ชื่อแผนก</th>
            <th className="py-2 px-6">SBU</th>
            <th className="py-2 px-6">STD</th>
            {scanStatus !== 'not_scanned' && (
                <th className="py-2 px-6">สแกนแล้ว</th>
            )}
            {scanStatus !== 'scanned' && (
                <th className="py-2 px-6">ยังไม่สแกน</th>
            )}
            <th className="py-2 px-6">พนักงานทั้งหมด</th>
            <th className="p-0">ดูรายละเอียด</th> 
          </tr>
        </thead>
        <tbody>
          {filteredDepartments.map((dept) => { 
            const linkDeptcode = dept.deptcode;
            const linkWorkdate = selectedDate; 

            // *** เพิ่มฟังก์ชันนี้เพื่อบันทึก selectedDate ลง localStorage ก่อนคลิกลิงก์ ***
            const handleLinkClick = () => {
              if (typeof window !== 'undefined') { 
                localStorage.setItem('prevDashboardDate', selectedDate);
    
              }
            };

            return (
              <tr key={dept.deptcode} className="border-b border-gray-100 last:border-b-0">
                <td className="py-2 px-6">{dept.deptcode}</td>
                <td className="py-2 px-6">{dept.deptname}</td>
                <td className="py-2 px-5">{dept.deptsbu}</td>
                <td className="py-2 px-6">{dept.deptstd}</td>
                {scanStatus !== 'not_scanned' && (
                  <td className="py-2 px-6">{dept.totalScanned}</td>
                )}
                {scanStatus !== 'scanned' && (
                  <td className="py-2 px-6">{dept.totalNotScanned}</td>
                )}
                <td className="py-2 px-6">{dept.totalPerson}</td>
                <td className="p-3">
                  <Link href={`/report/${linkDeptcode}?workdate=${linkWorkdate}`} onClick={handleLinkClick}>
                    <PiFileMagnifyingGlassBold size={30} className="text-blue-500 hover:text-blue-700" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}