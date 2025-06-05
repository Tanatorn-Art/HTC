import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PiFileMagnifyingGlassBold } from 'react-icons/pi';

import Spinner from '@/components/ui/Spinner';

type Employee = {
  workdate: string;
  groupid: string;
  groupname: string;
  deptcode: number;
  deptname: string;
  deptsbu: string;
  deptstd: string;
  employeeId?: string;
};

export function ManpowerTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]; 
        const response = await fetch(`/api/department?date=${today}`);
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data: Employee[] = await response.json();
        setEmployees(data);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

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

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-2 px-6">workdate</th>
            <th className="py-2 px-6">groupid</th>
            <th className="py-2 px-6">groupname</th>
            <th className="py-2 px-6">deptcode</th>
            <th className="py-2 px-6">deptname</th>
            <th className="py-2 px-6">deptsbu</th>
            <th className="py-2 px-6">deptstd</th>
            <th className="p-0"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr key={`${emp.deptcode}-${emp.workdate}-${emp.employeeId ?? 'noempid'}-${index}`}>
              <td className="py-2 px-6">{emp.workdate}</td>
              <td className="py-2 px-6">{emp.groupid}</td>
              <td className="py-2 px-6">{emp.groupname}</td>
              <td className="py-2 px-6">{emp.deptcode}</td>
              <td className="py-2 px-6">{emp.deptname}</td>
              <td className="py-2 px-6">{emp.deptsbu}</td>
              <td className="py-2 px-6">{emp.deptstd}</td>
              <td className="p-3">
                <Link href={`/api/attendance/report${emp.employeeId ?? ''}/page`}>
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
