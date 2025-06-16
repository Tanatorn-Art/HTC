'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic'; 
import AttendanceTextSummary from '@/components/AttendanceTextSummary';
import AttendanceCardSummary from '@/components/AttendanceCardSummary';
import { ManpowerTable } from '@/components/ManpowerTable'; 

const DepartmentBarChart = dynamic(
  () => import('@/components/DepartmentBarChart'),
  { ssr: false }
);

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedDate = localStorage.getItem('prevDashboardDate');
      if (storedDate) {
        localStorage.removeItem('prevDashboardDate');
        return storedDate;
      }
    }
    return new Date().toISOString().split('T')[0];
  });

  const [totalScanned, setTotalScanned] = useState(0);
  const [totalNotScanned, setTotalNotScanned] = useState(0);

  // *** เพิ่ม state สำหรับเลือกโรงงาน ***
  const [selectedFactory, setSelectedFactory] = useState('all'); 

  type SummaryData = {
    totalScanned: number;    
    totalNotScanned: number; 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/attendance/summary?date=${selectedDate}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }
        const data: SummaryData = await res.json();
        setTotalScanned(data.totalScanned);
        setTotalNotScanned(data.totalNotScanned);    
      } catch (err) {
        console.error("Error fetching attendance summary:", err);
        setTotalScanned(0);
        setTotalNotScanned(0);
      }
    };

    fetchData();
  }, [selectedDate]); 

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
          totalScanned={totalScanned}
          totalNotScanned={totalNotScanned}
        />

        <AttendanceCardSummary
          totalScanned={totalScanned}
          totalNotScanned={totalNotScanned}
        />
      </section>

      <section className="space-y-4">
        <h1 className="text-xl font-semibold">Department Overview</h1>
        <DepartmentBarChart apiEndpoint={`/api/department/Barchart?date=${selectedDate}`} />
      </section>

      <section className="space-y-4">
        <h1 className="text-xl font-semibold">Manpower Monitoring</h1>
      
        <div className="mb-4">
          <label htmlFor="factorySelect" className="block text-gray-700 font-medium mb-2">เลือกโรงงาน:</label>
          <select
            id="factorySelect"
            value={selectedFactory}
            onChange={(e) => setSelectedFactory(e.target.value)}
            className="mt-1 block border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="all">ทั้งหมด</option>
<<<<<<< HEAD
            <option value="06">โรงงาน 1 (06)</option>
            <option value="07">โรงงาน 2 (07)</option>
            <option value="08">โรงงาน 3 (08)</option> 
=======
            <option value="06">โรงงาน 1 (&quot;06&quot;)</option>
            <option value="07">โรงงาน 2 (&quot;07&quot;)</option>
            <option value="08">โรงงาน 3 (&quot;08&quot;)</option> 
>>>>>>> 2deda7007c2b3a30ca770efb1149214442633db6
          </select>
        </div>

        <ManpowerTable 
          selectedDate={selectedDate} 
          scanStatus="" 
        />
      </section>
    </div>
  );
}
