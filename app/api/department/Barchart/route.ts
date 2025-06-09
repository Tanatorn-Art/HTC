import { NextRequest } from 'next/server';
import db from '@/services/db';

interface DepartmentAttendanceRow {
  deptcode: string;       // รหัสแผนก
  department_name: string; // ชื่อแผนก
  count_scanned: string;  // จำนวนคนที่สแกนแล้ว
  count_not_scanned: string; // จำนวนคนที่ยังไม่สแกน
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const selectedDate = searchParams.get('date');

  // ตรวจสอบความถูกต้องของวันที่
  if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    return new Response(
      JSON.stringify({ error: 'รูปแบบวันที่ไม่ถูกต้อง โปรดใช้รูปแบบ ปี-เดือน-วัน (yyyy-mm-dd)' }),
      { status: 400 }
    );
  }

  try {
    const result = await db.query<DepartmentAttendanceRow>(
      `SELECT
          deptcode::text AS deptcode,       -- ดึง deptcode และแปลงเป็น text
          deptname AS department_name,
          SUM(countscan) AS count_scanned,       -- รวมจำนวนคนที่สแกนเข้าแล้ว
          SUM(countnotscan) AS count_not_scanned  -- รวมจำนวนคนที่ยังไม่สแกน
       FROM
          public.vw_manpower
       WHERE
          workdate = $1 -- กรองตามวันที่ที่เลือก
       GROUP BY
          deptcode, deptname    -- จัดกลุ่มตาม deptcode และ deptname
       ORDER BY
          deptname;
      `,
      [selectedDate] 
    );

    const departmentDataForChart = result.rows.map((row: DepartmentAttendanceRow) => ({
      deptcode: row.deptcode,
      department: row.department_name,
      scannedCount: parseInt(row.count_scanned || '0', 10),
      notScannedCount: parseInt(row.count_not_scanned || '0', 10),
    }));

    return new Response(JSON.stringify(departmentDataForChart), { status: 200 });

  } catch (err: any) {
    console.error('Failed to fetch department attendance data from vw_manpower:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error during department data fetch' }),
      { status: 500 }
    );
  }
}