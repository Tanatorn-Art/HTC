// app/report/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import ReportFilterForm from '../../components/ReportFilterForm';
import { DepartmentTable } from '../../components/DepartmentTable';
import { Employee, ReportApiRawData } from '../types/employee';

// --- Helper function: แยก deptcode ออกเป็นระดับต่างๆ (เหมือนใน ReportFilterForm) ---
const parseDeptCode = (fullDeptCode: string) => {
  const level1 = fullDeptCode.length >= 2 ? fullDeptCode.substring(0, 2) : '';
  const level2 = fullDeptCode.length >= 4 ? fullDeptCode.substring(0, 4) : '';
  const level3 = fullDeptCode.length >= 6 ? fullDeptCode.substring(0, 6) : ''; // ใช้ 6 หลักเป็นระดับสุดท้าย
  return { level1, level2, level3 };
};

// --- ฟังก์ชันหลักของหน้า (Page Component) ---
export default function ReportPage() {
  const today = new Date().toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    date: today,
    factoryId: '',
    mainDepartmentId: '',
    subDepartmentId: '',
    employeeId: 'all',
  });

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndProcessData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/manpower');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const rawData: ReportApiRawData[] = await res.json();

      const levelCodeToNameMap = new Map<string, string>();
      rawData.forEach(item => {
        if (item.deptcode) {
          const { level1, level2, level3 } = parseDeptCode(item.deptcode);
          if (level1 && item.deptname && (!levelCodeToNameMap.has(level1) || item.deptname.length > (levelCodeToNameMap.get(level1)?.length || 0))) {
              levelCodeToNameMap.set(level1, item.deptname);
          }
          if (level2 && item.deptname && (!levelCodeToNameMap.has(level2) || item.deptname.length > (levelCodeToNameMap.get(level2)?.length || 0))) {
              levelCodeToNameMap.set(level2, item.deptname);
          }
          if (level3 && item.deptname && (!levelCodeToNameMap.has(level3) || item.deptname.length > (levelCodeToNameMap.get(level3)?.length || 0))) {
              levelCodeToNameMap.set(level3, item.deptname);
          }
        }
      });

      // กรองข้อมูลก่อน
      const filteredRawData = rawData.filter(item => {
        if (filters.date && item.workdate !== filters.date) {
          return false;
        }
        if (!item.deptcode) return false;

        const { level1, level2, level3 } = parseDeptCode(item.deptcode);

        if (filters.factoryId && level1 !== filters.factoryId) {
          return false;
        }
        if (filters.mainDepartmentId && level2 !== filters.mainDepartmentId) {
          return false;
        }
        if (filters.subDepartmentId && level3 !== filters.subDepartmentId) {
          return false;
        }

        const countScanVal = parseInt(item.countscan || '0');
        const countNotScanVal = parseInt(item.countnotscan || '0');

        if (filters.employeeId === 'scanned' && countScanVal === 0) {
          return false;
        }
        if (filters.employeeId === 'not_scanned' && countNotScanVal === 0) {
          return false;
        }
        return true;
      });

      // --- ขั้นตอนใหม่: รวมกลุ่มข้อมูล (Group By Workdate และ OriginalFullDeptcode) ---
      const groupedData = new Map<string, Employee>();

      filteredRawData.forEach(item => {
        // ใช้ originalFullDeptcode และ workdate เป็น key สำหรับการรวมกลุ่ม
        const groupKey = `${item.workdate}-${item.deptcode}`;

        // แปลงค่าตัวเลขให้ปลอดภัยก่อนรวม
        const currentCountScan = parseInt(item.countscan || '0');
        const currentCountNotScan = parseInt(item.countnotscan || '0');
        const currentCountPerson = parseInt(item.countperson || '0');
        const currentLate = parseInt(item.late || '0');

        if (groupedData.has(groupKey)) {
          // ถ้ามี Key นี้อยู่แล้ว ให้รวมค่าตัวเลข
          const existingEmployee = groupedData.get(groupKey)!;
          existingEmployee.countscan += currentCountScan;
          existingEmployee.countnotscan += currentCountNotScan;
          existingEmployee.countperson += currentCountPerson;
          existingEmployee.late += currentLate;
          // Note: ข้อมูลอื่นๆ เช่น deptname, deptsbu, deptstd ถือว่าเหมือนกันสำหรับ groupKey เดียวกัน
          // หรือคุณอาจต้องมี logic เลือกตัวที่ต้องการหากมีค่าต่างกันใน groupเดียวกัน
        } else {
          // ถ้ายังไม่มี Key นี้ ให้สร้าง Employee object ใหม่
          const { level1, level2, level3 } = item.deptcode ? parseDeptCode(item.deptcode) : { level1: '', level2: '', level3: '' };

          groupedData.set(groupKey, {
            employeeId: item.employeeId || '', // อาจจะต้องคิดว่าจะแสดง employeeId หลายๆ คนในกลุ่มนี้ยังไง ถ้าต้องการ
            groupid: item.groupid || '',
            groupname: item.groupname || '',
            workdate: item.workdate || '',
            deptcode: level3, // 6 หลัก สำหรับ Logic ภายใน
            deptname: item.deptname || '',
            deptsbu: item.deptsbu || '',
            deptstd: item.deptstd !== undefined ? item.deptstd : null,
            countscan: currentCountScan,
            countnotscan: currentCountNotScan,
            countperson: currentCountPerson,
            late: currentLate,
            factoryCode: level1,
            factoryName: levelCodeToNameMap.get(level1) || `โรงงาน ${level1}`,
            mainDepartmentCode: level2,
            mainDepartmentName: levelCodeToNameMap.get(level2) || `แผนกหลัก ${level2}`,
            subDepartmentCode: level3,
            subDepartmentName: levelCodeToNameMap.get(level3) || item.deptname || `แผนกย่อย/ส่วนงาน ${level3}`,
            originalFullDeptcode: item.deptcode, // 8 หลัก สำหรับแสดงผล
          });
        }
      });

      // แปลง Map กลับไปเป็น Array เพื่อส่งให้ DepartmentTable
      const processedData: Employee[] = Array.from(groupedData.values());

      // (Optional) จัดเรียงข้อมูลหากต้องการ เช่น ตาม deptcode หรือ workdate
      processedData.sort((a, b) => {
        if (a.workdate !== b.workdate) return a.workdate.localeCompare(b.workdate);
        return a.originalFullDeptcode.localeCompare(b.originalFullDeptcode);
      });

      setFilteredEmployees(processedData);

    } catch (err) {
      console.error('Error fetching or processing data:', err);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAndProcessData();
  }, [fetchAndProcessData]);

  const handleSearch = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">รายงานข้อมูลการสแกน</h1>

      <ReportFilterForm onSearch={handleSearch} initialFilters={filters} />

      {loading ? (
        <div className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</div>
      ) : (
        <DepartmentTable employees={filteredEmployees} scanStatus={filters.employeeId} />
      )}
    </div>
  );
}