'use client';

import Link from 'next/link';
import { PiFileMagnifyingGlassBold } from "react-icons/pi";
import { Employee } from '../app/types/employee'; 

export type DepartmentTableProps = {
  employees: Employee[]; 
  scanStatus?: string; 
};

export function DepartmentTable({ employees, scanStatus = 'all' }: DepartmentTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-2 px-6">Workdate</th>
            <th className="py-2 px-6">Deptcode </th> 
            <th className="py-2 px-6">Deptname</th>
            <th className="py-2 px-6">SBU</th>
            <th className="py-2 px-6">STD</th>
            {scanStatus !== 'not_scanned' && (
              <th className="py-2 px-6">Scan</th>
            )}
            {scanStatus !== 'scanned' && (
              <th className="py-2 px-6">No Scan</th>
            )}
            <th className="py-2 px-6">Person</th>
            <th className="p-0"></th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((emp, index) => {
              // ใช้ emp.originalFullDeptcode ในการสร้าง key และ URL
              const safeDeptCode = emp.originalFullDeptcode || `invalid-dept-${index}`; 
              const safeWorkDate = emp.workdate || 'invalid-date';

              return (
                <tr
                  key={`${safeDeptCode}-${safeWorkDate}-${index}`}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="py-2 px-6">{emp.workdate}</td>
                  {/* แสดง originalFullDeptcode (8 หลัก) */}
                  <td className="py-2 px-6">{emp.originalFullDeptcode}</td> 
                  <td className="py-2 px-5">{emp.deptname}</td>
                  <td className="py-2 px-6">{emp.deptsbu}</td>
                  <td className="py-2 px-6">{emp.deptstd}</td>

                  {scanStatus !== 'not_scanned' && (
                    <td className="py-2 px-6">{emp.countscan}</td>
                  )}
                  {scanStatus !== 'scanned' && (
                    <td className="py-2 px-6">{emp.countnotscan}</td>
                  )}
                  <td className="py-2 px-6">{emp.countperson}</td>
                  <td className="p-3">
                    {emp.originalFullDeptcode && emp.workdate ? ( 
                      <Link
                        href={`/report/${encodeURIComponent(safeDeptCode)}?workdate=${encodeURIComponent(safeWorkDate)}`}
                        passHref
                      >
                        <PiFileMagnifyingGlassBold
                          size={30}
                          className="text-blue-500 hover:text-blue-700"
                          title="ดูรายละเอียด"
                        />
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">ไม่สามารถเปิดดูได้</span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={scanStatus === 'all' ? 9 : 8} className="py-4 px-6 text-center text-gray-500">
                ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}