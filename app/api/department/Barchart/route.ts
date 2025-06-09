import { NextRequest } from 'next/server';
import db from '@/services/db';

interface DepartmentAttendanceRow {
  deptcode: string;       
  department_name: string; 
  count_scanned: string;  
  count_not_scanned: string; 
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
    const result = await db.query(
      `SELECT
          deptcode::text AS deptcode,
          deptname AS department_name,
          SUM(countscan) AS count_scanned,
          SUM(countnotscan) AS count_not_scanned
       FROM
          public.vw_manpower
       WHERE
          workdate = $1
       GROUP BY
          deptcode, deptname
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

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Failed to fetch department attendance data from vw_manpower:', err.message);
    } else {
      console.error('Unknown error:', err);
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error during department data fetch' }),
      { status: 500 }
    );
  }
}
