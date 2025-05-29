'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

interface Employee {
  id: number;
  name: string;
  wecom_id: string;
  is_hod?: boolean;
}

interface Department {
  id: number;
  name: string;
  employees: Employee[];
}

type ExportButtonsProps = {
  departments: Department[];
  hods: { [deptId: number]: string };
};

export default function ExportButtons({ departments, hods }: ExportButtonsProps) {
  const transformData = () => {
    return departments.map((dept) => {
      const hodWeComId = hods[dept.id] || '';
      const hodEmployee = dept.employees.find((e) => e.wecom_id === hodWeComId);
      return {
        DepartmentID: dept.id,
        DepartmentName: dept.name,
        HODName: hodEmployee?.name || '',
        HODWeComID: hodWeComId,
      };
    });
  };

  const exportCSV = () => {
    const data = transformData();
    if (data.length > 0) {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'department_hods.csv');
    } else {
      alert('ไม่มีข้อมูลสำหรับ export');
    }
  };

  const exportExcel = async () => {
    const data = transformData();
    if (data.length > 0) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('HOD Report');

      worksheet.columns = Object.keys(data[0]).map((key) => ({
        header: key,
        key: key,
        width: 20,
      }));

      data.forEach((row) => worksheet.addRow(row));

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      saveAs(blob, 'department_hods.xlsx');
    } else {
      alert('ไม่มีข้อมูลสำหรับ export');
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={exportCSV}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        Export CSV
      </button>
      <button
        onClick={exportExcel}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
      >
        Export Excel
      </button>
    </div>
  );
}
