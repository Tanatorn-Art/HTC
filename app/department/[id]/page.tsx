'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { DepartmentTable } from '@/components/DepartmentTable';
import Spinner from '@/components/ui/Spinner';

type Employee = {
  employeeId: string;
  groupid: string;
  groupname: string;
  workdate: string;
  deptcode: number;
  deptname: string;
  deptsbu: string;
  deptstd: string;
};

type EmployeeRaw = {
  id?: string;
  groupid?: string;
  groupname?: string;
  workdate?: string;
  deptcode?: number | string;
  deptname?: string;
  deptsbu?: string;
  deptstd?: string;
};

export default function DepartmentDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [department, setDepartment] = useState<{ name: string; employees: Employee[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchDepartment() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';
        const base = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
        const res = await fetch(`${base}/api/department/${id}`);

        if (!res.ok) {
          notFound();
          return;
        }

        const data = await res.json();

        const employees: Employee[] = data.employees.map((emp: EmployeeRaw) => ({
          employeeId: emp.id ?? '',
          groupid: emp.groupid ?? '',
          groupname: emp.groupname ?? '',
          workdate: emp.workdate ?? '',
          deptcode: Number(emp.deptcode ?? 0),
          deptname: emp.deptname ?? '',
          deptsbu: emp.deptsbu ?? '',
          deptstd: emp.deptstd ?? '',
        }));

        setDepartment({ name: data.name, employees });
      } catch (error) {
        console.error('Failed to fetch department: ', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchDepartment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!department) {
    return null;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">แผนก : {department.name}</h1>
      <DepartmentTable employees={department.employees} />
    </div>
  );
}
