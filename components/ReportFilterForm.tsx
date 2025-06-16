'use client';

import { useEffect, useState } from 'react';
import { ReportApiRawData } from '@/app/types';

// ปรับปรุงชื่อ Prop ให้ตรงกับการใช้งานจริง
type Props = {
  onSearch: (filters: { date: string; departmentId: string; scanStatus: string }) => void;
  initialFilters: {
    date: string;
    departmentId: string;
    scanStatus: string;
  };
};

type DepartmentForDropdown = {
  deptcode: string; // เรายังเก็บ deptcode ไว้เพื่อใช้ส่งค่ากลับไปเมื่อเลือก
  deptname: string;
};

const ReportFilterForm = ({ onSearch, initialFilters }: Props) => {
  const [date, setDate] = useState(initialFilters.date);
  const [departmentId, setDepartmentId] = useState(initialFilters.departmentId);
  const [scanStatus, setScanStatus] = useState(initialFilters.scanStatus);

  const [departments, setDepartments] = useState<DepartmentForDropdown[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  useEffect(() => {
    setLoadingDepartments(true);
    fetch('/api/manpower')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: ReportApiRawData[]) => {
        if (Array.isArray(data)) {
          const uniqueDepartmentsForDropdown: DepartmentForDropdown[] = [];
          const seenDeptnames = new Set<string>(); // ใช้ Set เพื่อเก็บ deptname ที่เห็นแล้ว

          data.forEach(item => {
            const code = item.deptcode;
            const name = item.deptname;

            // ตรวจสอบว่า deptname และ deptcode มีค่า และ deptname ยังไม่เคยถูกเพิ่มเข้ามา
            if (code && name && !seenDeptnames.has(name)) {
              uniqueDepartmentsForDropdown.push({ deptcode: code, deptname: name });
              seenDeptnames.add(name); // เพิ่ม deptname เข้าไปใน Set
            }
          });
          // หากต้องการเรียงลำดับตามตัวอักษร
          uniqueDepartmentsForDropdown.sort((a, b) => a.deptname.localeCompare(b.deptname));

          setDepartments(uniqueDepartmentsForDropdown);
        } else {
          console.warn('รูปแบบข้อมูลแผนกไม่ถูกต้อง: ข้อมูลไม่ใช่ Array', data);
          setDepartments([]);
        }
      })
      .catch(err => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแผนก:', err);
        setDepartments([]);
      })
      .finally(() => {
        setLoadingDepartments(false);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ date, departmentId, scanStatus });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="date-input" className="block mb-1 font-medium text-gray-700">วันที่</label>
          <input
            id="date-input"
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* ช่องเลือกแผนก */}
        <div>
          <label htmlFor="department-select" className="block mb-1 font-medium text-gray-700">แผนก</label>
          <select
            id="department-select"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
            }}
            disabled={loadingDepartments}
          >
            <option key="default-department" value="">
              {loadingDepartments ? 'กำลังโหลดแผนก...' : '-- ทั้งหมด --'}
            </option>
            {departments.map((d) => (
              <option key={`department-${d.deptcode}`} value={d.deptcode}>
                {d.deptname}
              </option>
            ))}
          </select>
        </div>

        {/* ช่องเลือกสถานะการสแกน */}
        <div>
          <label htmlFor="scan-status-select" className="block mb-1 font-medium text-gray-700">สถานะ</label>
          <select
            id="scan-status-select"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={scanStatus}
            onChange={(e) => setScanStatus(e.target.value)}
          >
            <option key="scan-status-all" value="all">
              -- ทั้งหมด --
            </option>
            <option key="scan-status-scanned" value="scanned">
              สแกนแล้ว
            </option>
            <option key="scan-status-notscanned" value="not_scanned">
              ยังไม่สแกน
            </option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors duration-200"
      >
        ค้นหา
      </button>
    </form>
  );
};

export default ReportFilterForm;