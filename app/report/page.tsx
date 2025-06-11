'use client';

import { useState, useEffect } from 'react';
import ReportFilterForm from '@/components/ReportFilterForm';
import { DepartmentTable } from '@/components/DepartmentTable';
import Spinner from '@/components/ui/Spinner';
import Papa from 'papaparse';
import { Employee, ReportApiRawData } from '../types/employee';

type Filters = {
  date: string;
  departmentId: string;
  employeeId: string;
};

const SESSION_STORAGE_FILTERS_KEY = 'reportPageFilters';

export default function ReportPage() {
  const [records, setRecords] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  // *** ปรับปรุง useState สำหรับ Filters โดยโหลดจาก sessionStorage ***
  const [currentFilters, setCurrentFilters] = useState<Filters>(() => {
    if (typeof window !== 'undefined') {
      const savedFilters = sessionStorage.getItem(SESSION_STORAGE_FILTERS_KEY);
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters);
        } catch (e) {
          console.error('Failed to parse saved filters from sessionStorage:', e);
          return {
            date: new Date().toISOString().slice(0, 10),
            departmentId: '',
            employeeId: 'all',
          };
        }
      }
    }
    return {
      date: new Date().toISOString().slice(0, 10),
      departmentId: '',
      employeeId: 'all',
    };
  });

  const handleSearch = async (newFilters: Filters) => {
    console.log('ReportPage: Searching with filters:', newFilters);
    setCurrentFilters(newFilters);
    // *** บันทึก Filters ลง sessionStorage ทันทีที่มีการค้นหาใหม่ ***
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_FILTERS_KEY, JSON.stringify(newFilters));
    }
  };

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true);

      const params = new URLSearchParams({
        date: currentFilters.date || '',
        departmentId: currentFilters.departmentId || '',
        employeeId: currentFilters.employeeId || '',
      }).toString();

      try {
        const res = await fetch(`/api/attendance/report?${params}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch report data');
        }
        const rawData: ReportApiRawData[] = await res.json();

        const mappedRecords: Employee[] = rawData.map((rec) => {
          const deptCodeFinal = rec.deptcode || '';
          const countScanNum = parseInt(rec.countscan?.toString() || '0', 10);
          const countNotScanNum = parseInt(rec.countnotscan?.toString() || '0', 10);
          const countPersonNum = parseInt(rec.countperson?.toString() || '0', 10);

          return {
            workdate: rec.workdate || '',
            groupid: rec.groupid || '',
            groupname: rec.groupname || '',
            deptcode: deptCodeFinal,
            deptname: rec.deptname || '',
            deptsbu: rec.deptsbu || '',
            deptstd: rec.deptstd || '',
            countscan: countScanNum,
            countnotscan: countNotScanNum,
            countperson: countPersonNum,
            employeeId: rec.employeeId || '',
          };
        });

        console.log('ReportPage: Mapped Records before setting state:', mappedRecords);

        setRecords(mappedRecords);
      } catch (err) {
        console.error('ReportPage: Error fetching attendance report:', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }

    // *** เรียก fetchReportData ทันทีเมื่อ currentFilters เปลี่ยนแปลง ***
    fetchReportData();
  }, [currentFilters]);

  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('ไม่มีข้อมูลให้ Export');
      return;
    }
    const csv = Papa.unparse(records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance_report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">รายงานการเข้างาน</h1>
      <ReportFilterForm onSearch={handleSearch} initialFilters={currentFilters} />

      {loading ? (
        <Spinner />
      ) : records.length === 0 ? (
        <div className="text-center text-gray-400">ไม่พบข้อมูล</div>
      ) : (
        <>
          <DepartmentTable
            employees={records}
            scanStatus={currentFilters.employeeId}
          />
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
          >
            Export CSV
          </button>
        </>
      )}
    </div>
  );
}