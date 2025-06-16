'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PiFileMagnifyingGlassBold } from 'react-icons/pi';
import Spinner from './ui/Spinner'; // ตรวจสอบเส้นทางว่าถูกต้องหรือไม่

// ตรวจสอบให้แน่ใจว่า Employee Type ในไฟล์นี้ตรงกับโครงสร้างข้อมูลที่ API ส่งมา
export type Employee = {
  deptcode: string;
  deptname: string;
  deptsbu: string;
  deptstd: string;
  countscan: string; // อาจเป็น string จาก API
  countnotscan: string; // อาจเป็น string จาก API
  countperson: string; // อาจเป็น string จาก API
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
      // กรองตาม deptcodelevel1Filter ถ้ามี
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

      // แปลงค่า string เป็น number ก่อนบวก
      currentDept.totalScanned += Number(emp.countscan || '0');
      currentDept.totalNotScanned += Number(emp.countnotscan || '0');
      currentDept.totalPerson += Number(emp.countperson || '0');
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

  // --- UI สำหรับ Loading, Error, No Data ---
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
        <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg shadow-sm m-4">
        <p className="font-semibold">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (filteredDepartments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-md m-4">
        <p className="text-lg">ไม่พบข้อมูลสำหรับวันที่เลือก หรือตัวกรองที่ระบุ</p>
        <p className="text-sm mt-2">โปรดลองเลือกวันที่อื่น หรือปรับตัวกรอง</p>
      </div>
    );
  }

  return (
    // ปรับปรุง div หลักให้มีเงาและกรอบโค้งมนตามสไตล์ Google
    <div className="overflow-x-auto bg-white rounded-2xl shadow-xl p-6">
      <table className="min-w-full text-sm text-left border-collapse">
        {/* Header ของตาราง: สีเทาอ่อน, ตัวอักษรหนา, โค้งมนด้านบน */}
        <thead className="bg-gray-50 text-gray-700 tracking-wider rounded-t-lg">
          <tr>
            <th className="py-3 px-6">Deptcode</th>
            <th className="py-3 px-6">Deptname</th>
            <th className="py-3 px-6">SBU</th>
            <th className="py-3 px-6">STD</th>
            {scanStatus !== 'not_scanned' && (
              <th className="py-3 px-6">Scan</th>
            )}
            {scanStatus !== 'scanned' && (
              <th className="py-3 px-6 ">No scan</th>
            )}
            <th className="py-3 px-6">Person</th>
            <th className="p-3 ">Detail</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartments.map((dept, index) => {
            const linkDeptcode = dept.deptcode;
            const linkWorkdate = selectedDate;

            // ฟังก์ชันสำหรับบันทึก selectedDate ลง localStorage ก่อนคลิกลิงก์
            const handleLinkClick = () => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('prevDashboardDate', selectedDate);
              }
            };

            return (
              <tr
                key={dept.deptcode} // Key ควรเป็นค่าที่ unique เช่น deptcode
                // เพิ่มสีพื้นหลังสลับกัน และเพิ่มเส้นขอบล่างที่ดูบางเบา
                className={`
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  ${index === filteredDepartments.length - 1 ? '' : 'border-b border-gray-100'}
                  hover:bg-gray-100 transition-colors duration-150
                `}
              >
                <td className="py-3 px-6 text-gray-800">{dept.deptcode}</td>
                <td className="py-3 px-6 text-gray-800">{dept.deptname}</td>
                <td className="py-3 px-5 text-gray-800">{dept.deptsbu}</td>
                <td className="py-3 px-6 text-gray-800">{dept.deptstd}</td>
                {scanStatus !== 'not_scanned' && (
                  <td className="py-3 px-6 text-gray-800">{dept.totalScanned}</td>
                )}
                {scanStatus !== 'scanned' && (
                  <td className="py-3 px-6 text-gray-800">{dept.totalNotScanned}</td>
                )}
                <td className="py-3 px-6 text-gray-800">{dept.totalPerson}</td>
                <td className="p-3">
                  <Link
                    href={`/report/${encodeURIComponent(linkDeptcode)}?workdate=${encodeURIComponent(linkWorkdate)}`}
                    onClick={handleLinkClick}
                    className="flex items-center justify-center" // จัดไอคอนให้อยู่ตรงกลาง
                    title="ดูรายละเอียดการสแกนของแผนกนี้"
                  >
                    <PiFileMagnifyingGlassBold size={24} className="text-blue-600 hover:text-blue-800 transition-colors duration-200" />
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