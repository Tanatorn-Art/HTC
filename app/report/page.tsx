'use client';

import { useState } from 'react';
import ReportFilterForm from '@/components/ReportFilterForm';
import { DepartmentTable } from '@/components/DepartmentTable';
import Spinner from '@/components/ui/Spinner';
import Papa from 'papaparse';

type Filters = {
  date: string;
  departmentId: string;
  employeeId: string;
};

type Record = {
  workdate: string;
  groupid: string;
  groupname: string;
  deptcode: number;
  deptname: string;
  deptsbu: string;
  deptstd: string;
  scan: number;
  noscan: number;
  late: number;
  employeeId: string;
};

export default function ReportPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (newFilters: Filters) => {
    setLoading(true);

    const params = new URLSearchParams(newFilters).toString();
    const res = await fetch(`/api/attendance/report?${params}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      setRecords(data);
    } else {
      console.error('Unexpected data format:', data);
      setRecords([]);
    }

    setLoading(false);
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance_report.csv';
    link.click();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">รายงานการเข้าง</h1>
      <ReportFilterForm onSearch={handleSearch} />

      {loading ? (
        <Spinner/>
      ) : records.length === 0 ? (
        <div className="text-center text-gray-400">ไม่พบข้อมูล</div>
      ) : (
        <>
          <DepartmentTable
            employees={records.map((rec) => ({
              workdate: rec.workdate || '',
              deptcode: rec.deptcode,
              deptname: rec.deptname,
              deptsbu: rec.deptsbu || '',
              deptstd: rec.deptstd || '',
              total: 1,
              scan: rec.scan || 0,
              noscan: rec.noscan || 0,
              employeeId: rec.employeeId,
              groupid: rec.groupid || '',         
              groupname: rec.groupname || '', 
            }))}
          />
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
        </>
      )}
    </div>
  );
}
