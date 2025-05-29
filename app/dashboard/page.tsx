'use client';

import { useEffect, useState } from 'react';
import AttendanceTextSummary from '@/components/AttendanceTextSummary';
import AttendanceCardSummary from '@/components/AttendanceCardSummary';
import { ManpowerTable } from '@/components/ManpowerTable';
import DepartmentBarChart from '@/components/DepartmentBarChart';

export default function DashboardPage() {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [checkedIn, setCheckedIn] = useState(0);
  const [lateCount, setLateCount] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  type DeptSummary = {
    countPerson: number;
    countScan: number;
    countLate: number;
   };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/attendance/summary?date=${today}`);
        if (!res.ok) throw new Error('Failed to fetch data');
        const data: DeptSummary[] = await res.json();

        const total = data.reduce((sum, dept) => sum + dept.countPerson, 0);
        const scanned = data.reduce((sum, dept) => sum + dept.countScan, 0);
        const late = data.reduce((sum, dept) => sum + dept.countLate, 0);

        setTotalEmployees(total);
        setCheckedIn(scanned);
        setLateCount(late);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [today]);

  const notCheckedIn = totalEmployees - checkedIn;


  return (
    <div className="p-6 space-y-6">
 
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">ภาพรวมวันนี้</h1>

        <AttendanceTextSummary
          date={today}
          totalEmployees={totalEmployees}
          checkedIn={checkedIn}
          notCheckedIn={notCheckedIn}
        />

        <AttendanceCardSummary
          total={totalEmployees}
          checkedIn={checkedIn}
          lateCount={lateCount}
        />
      </section>

      <section className="space-y-4">
        <h1 className="text-xl font-semibold">Department Overview</h1>
        <DepartmentBarChart apiEndpoint={`/api/attendance/summary?date=${today}`} />
      </section>

      <section className="space-y-4">
        <h1 className="text-xl font-semibold">Manpower Monitoring</h1>
        <ManpowerTable />
      </section>
    </div>
  );
}
