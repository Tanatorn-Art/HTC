'use client';

import { useEffect, useState } from 'react';
import AttendanceTextSummary from '@/components/AttendanceTextSummary';
import AttendanceCardSummary from '@/components/AttendanceCardSummary';
// import { ManpowerTable } from '@/components/ManpowerTable'; // ตรวจสอบว่า ManpowerTable ยังคงต้องการข้อมูลอะไร
import DepartmentBarChart from '@/components/DepartmentBarChart'; // ตรวจสอบว่า DepartmentBarChart ยังคงต้องการข้อมูลอะไร

export default function DashboardPage() {
  // กำหนดวันที่เริ่มต้นเป็นวันที่ปัจจุบัน
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // States สำหรับเก็บข้อมูลสรุปรวมของทั้งบริษัท
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [checkedIn, setCheckedIn] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [notCheckedIn, setNotCheckedIn] = useState(0); // เพิ่ม state สำหรับคนไม่สแกน

  // กำหนด Type ของข้อมูลที่คาดว่าจะได้รับจาก API ใหม่
  type SummaryData = {
    totalEmployees: number;
    checkedIn: number;
    lateCount: number;
    notCheckedIn: number;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/attendance/summary?selectdate=${selectedDate}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }
        const data: SummaryData = await res.json();
        setTotalEmployees(data.totalEmployees); 
        setCheckedIn(data.checkedIn);           
        setLateCount(data.lateCount);           
        setNotCheckedIn(data.notCheckedIn);     

      } catch (err) {
        console.error("Error fetching attendance summary:", err);
      }
    };

    fetchData();
  }, [selectedDate]); // Dependency Array: จะเรียก fetchData ใหม่เมื่อ selectedDate เปลี่ยน

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

        {/* ส่งข้อมูลสรุปให้ AttendanceTextSummary */}
        <AttendanceTextSummary
          date={selectedDate}
          totalEmployees={totalEmployees}
          checkedIn={checkedIn}
          notCheckedIn={notCheckedIn}
          // หาก AttendanceTextSummary ต้องการ lateCount ด้วย ให้ส่งเพิ่ม
        />

        {/* ส่งข้อมูลสรุปให้ AttendanceCardSummary */}
        <AttendanceCardSummary
         // total={totalEmployees}
          checkedIn={checkedIn}
          lateCount={lateCount}
          notCheckedIn={notCheckedIn}
          // หาก AttendanceCardSummary ต้องการ notCheckedIn ด้วย ให้ส่งเพิ่ม
        />
      </section>
      <section className="space-y-4">
  <h1 className="text-xl font-semibold">Department Overview</h1>
      {/* *** แก้ไข apiEndpoint ตรงนี้ *** */}
      <DepartmentBarChart apiEndpoint={`/api/department?date=${selectedDate}`} />
      </section>

      <section className="space-y-4">
        <h1 className="text-xl font-semibold">Manpower Monitoring</h1>
        {/*
          ManpowerTable จะต้องดึงข้อมูลเอง หรือคุณอาจต้องส่ง props ให้มัน
          ขึ้นอยู่กับว่า ManpowerTable ต้องการข้อมูลอะไร
        */}
        
      </section>
    </div>
  );
}