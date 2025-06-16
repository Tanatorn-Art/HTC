'use client';

import Link from 'next/link';
import { PiFileMagnifyingGlassBold } from "react-icons/pi";
import { Employee } from '../app/types';

export type DepartmentTableProps = {
  employees: Employee[];
  scanStatus?: string; // Optional
};

export function DepartmentTable({ employees, scanStatus = 'all' }: DepartmentTableProps) {
  return (
    // เพิ่มเงาและความโค้งมนที่กรอบใหญ่
    <div className="overflow-x-auto bg-white rounded-2xl shadow-xl p-6"> {/* ปรับ shadow-lg เป็น shadow-xl และเพิ่ม p-6 */}
      <table className="min-w-full text-sm text-left border-collapse">
        {/* Header ของตาราง: ใช้สีเทาอ่อน พื้นหลังโปร่ง โค้งมนด้านบน */}
        <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider rounded-t-lg"> {/* เพิ่ม rounded-t-lg */}
          <tr>
            <th className="py-3 px-6 font-semibold">Work Date</th>
            <th className="py-3 px-6 font-semibold">Dept. Code</th>
            <th className="py-3 px-6 font-semibold">Dept. Name</th>
            <th className="py-3 px-6 font-semibold">SBU</th>
            <th className="py-3 px-6 font-semibold">STD</th>
            {scanStatus !== 'not_scanned' && (
              <th className="py-3 px-6 font-semibold">Scan</th>
            )}
            {scanStatus !== 'scanned' && (
              <th className="py-3 px-6 font-semibold">No Scan</th>
            )}
            <th className="py-3 px-6 font-semibold">Person</th>
            <th className="p-0"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => {
            const safeDeptCode = typeof emp.deptcode === 'string' && emp.deptcode !== 'undefined' ? emp.deptcode : 'unknown';
            const safeWorkDate = emp.workdate || '';

            return (
              <tr
                key={`${safeDeptCode}-${safeWorkDate}-${index}`}
                // เพิ่มสีพื้นหลังสลับกัน และเพิ่มเส้นขอบล่างที่ดูบางเบา
                className={`
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                  ${index === employees.length -1 ? '' : 'border-b border-gray-100'} 
                  hover:bg-gray-100 transition-colors duration-150
                `}
              >
                <td className="py-3 px-6 text-gray-800">{emp.workdate}</td> {/* เพิ่ม py-3 */}
                <td className="py-3 px-6 text-gray-800">{emp.deptcode}</td>
                <td className="py-3 px-5 text-gray-800">{emp.deptname}</td>
                <td className="py-3 px-6 text-gray-800">{emp.deptsbu}</td>
                <td className="py-3 px-6 text-gray-800">{emp.deptstd}</td>

                {scanStatus !== 'not_scanned' && (
                  <td className="py-3 px-6 text-gray-800">{emp.countscan}</td>
                )}
                {scanStatus !== 'scanned' && (
                  <td className="py-3 px-6 text-gray-800">{emp.countnotscan}</td>
                )}
                <td className="py-3 px-6 text-gray-800">{emp.countperson}</td>
                <td className="p-3">
                  {emp.deptcode && emp.workdate ? (
                    <Link
                      href={`/report/${encodeURIComponent(safeDeptCode)}?workdate=${encodeURIComponent(safeWorkDate)}`}
                      passHref
                    >
                      <PiFileMagnifyingGlassBold
                        size={30}
                        className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                        title="ดูรายละเอียด"
                      />
                    </Link>
                  ) : (
                    <span className="text-gray-400 italic">ไม่สามารถเปิดดูได้</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}