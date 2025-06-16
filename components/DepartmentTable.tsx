'use client';

import Link from 'next/link';
import { PiFileMagnifyingGlassBold } from "react-icons/pi";
import { Employee } from '../app/types/employee';

export type DepartmentTableProps = {
  employees: Employee[];
  scanStatus?: string; // Optional
};

export function DepartmentTable({ employees, scanStatus = 'all' }: DepartmentTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-2 px-6">Work Date</th>
            <th className="py-2 px-6">Dept. Code</th>
            <th className="py-2 px-6">Dept. Name</th>
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
          {employees.map((emp, index) => {
            const safeDeptCode = typeof emp.deptcode === 'string' && emp.deptcode !== 'undefined' ? emp.deptcode : 'unknown';
            const safeWorkDate = emp.workdate || '';

            return (
              <tr
                key={`${safeDeptCode}-${safeWorkDate}-${index}`}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="py-2 px-6">{emp.workdate}</td>
                <td className="py-2 px-6">{emp.deptcode}</td>
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
                  {emp.deptcode && emp.workdate ? (
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
          })}
        </tbody>
      </table>
    </div>
  );
}
