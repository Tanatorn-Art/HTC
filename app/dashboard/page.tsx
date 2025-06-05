'use client';

import { useEffect, useState } from 'react';
import AttendanceTextSummary from '@/components/AttendanceTextSummary';
import AttendanceCardSummary from '@/components/AttendanceCardSummary';
import { ManpowerTable } from '@/components/ManpowerTable';
import DepartmentBarChart from '@/components/DepartmentBarChart';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [checkedIn, setCheckedIn] = useState(0);
  const [lateCount, setLateCount] = useState(0);

  type DeptSummary = {
    countPerson: number;
    countScan: number;
    countLate: number;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/attendance/summary?date=${selectedDate}`);
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
  }, [selectedDate]);

  const notCheckedIn = totalEmployees - checkedIn;

  return (
    <div className="p-6 space-y-6">
      <section className="space-y-4">
        <label className="block">
          <span className="text-gray-700 font-medium">เลือกวันที่:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </label>
      </section>

      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">ภาพรวมวันที่ {selectedDate}</h1>

        <AttendanceTextSummary
          date={selectedDate}
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
        <DepartmentBarChart apiEndpoint={`/api/attendance/summary?date=${selectedDate}`} />
      </section>

      <section className="space-y-4">
        <h1 className="text-xl font-semibold">Manpower Monitoring</h1>
        <ManpowerTable />
      </section>
    </div>
  );
}