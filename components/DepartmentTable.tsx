import Link from 'next/link';
import { PiFileMagnifyingGlassBold } from "react-icons/pi";

type Employee = {
  workdate: string;
  deptcode: number;
  deptname: string;
  deptsbu: string;
  deptstd: string;
  total: number;
  scan: number;
  noscan: number;
  employeeId?: string;  
};

export function DepartmentTable({ employees }: { employees: Employee[] }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-2 px-6">workdate</th>
            <th className="py-2 px-6">deptcode</th>
            <th className="py-2 px-6">deptname</th>
            <th className="py-2 px-6">deptsbu</th>
            <th className="py-2 px-6">deptstd</th>
            <th className="py-2 px-6">total</th>
            <th className="py-2 px-6">scan</th>
            <th className="py-2 px-6">noscan</th>
            <th className="p-0"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr key={`${emp.deptcode}-${emp.workdate}-${emp.employeeId ?? 'noempid'}-${index}`}>
              <td className="py-2 px-6">{emp.workdate}</td>
              <td className="py-2 px-6">{emp.deptcode}</td>
              <td className="py-2 px-5">{emp.deptname}</td>
              <td className="py-2 px-6">{emp.deptsbu}</td>
              <td className="py-2 px-6">{emp.deptstd}</td>
              <td className="py-2 px-6">{emp.scan}</td>
              <td className="py-2 px-6">{emp.noscan}</td>
              <td className="py-2 px-6">{emp.noscan}</td>
              <td className="p-3">
                <Link href={`../report/${emp.employeeId ?? ''}/page`}>
                  <PiFileMagnifyingGlassBold size={30} className="text-blue-500 hover:text-blue-700" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
