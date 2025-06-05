'use client';

import { useEffect, useState } from 'react';

type Props = {
  onSearch: (filters: { date: string; departmentId: string; employeeId: string }) => void;
};

type Department = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  name: string;
};

const ReportFilterForm = ({ onSearch }: Props) => {
  const [date, setDate] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    fetch('/api/department')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched departments:', data);
        // ตรวจสอบว่า data เป็น array หรือ object ที่มี property เป็น array
        if (Array.isArray(data)) {
          setDepartments(data);
        } else if (data && Array.isArray(data.departments)) {
          setDepartments(data.departments);
        } else {
          console.warn('Unexpected departments data format:', data);
          setDepartments([]);
        }
      })
      .catch(err => {
        console.error('Error fetching departments:', err);
        setDepartments([]);
      });
  }, []);

  useEffect(() => {
    if (departmentId) {
      fetch(`/api/employees?departmentId=${departmentId}`)
        .then(res => res.json())
        .then(data => {
          console.log('Fetched employees:', data);
          if (Array.isArray(data)) {
            setEmployees(data);
          } else if (data && Array.isArray(data.employees)) {
            setEmployees(data.employees);
          } else {
            console.warn('Unexpected employees data format:', data);
            setEmployees([]);
          }
        })
        .catch(err => {
          console.error('Error fetching employees:', err);
          setEmployees([]);
        });
    } else {
      setEmployees([]);
    }
  }, [departmentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ date, departmentId, employeeId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium">วันที่</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">แผนก</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option key="default-department" value="">
              -- เลือกแผนก --
            </option>
            {departments.map((d, idx) => (
              <option key={`department-${d.id}-${idx}`} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">พนักงาน</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option key="default-employee" value="">
              -- ทั้งหมด --
            </option>
            {employees.map((e, idx) => (
              <option key={`employee-${e.id}-${idx}`} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        ค้นหา
      </button>
    </form>
  );
};

export default ReportFilterForm;
