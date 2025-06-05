import { NextRequest } from 'next/server';
import db from '@/services/db'; // นำเข้าโมดูลเชื่อมต่อฐานข้อมูล

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const selectdate = searchParams.get('selectdate'); // ดึงค่า 'date' จาก URL Query Parameter
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // รูปแบบวันที่ YYYY-MM-DD

  //  ตรวจสอบความถูกต้องของวันที่ที่ส่งมา
  if (!selectdate || !dateRegex.test(selectdate)) {
    // ปรับข้อความ Error ให้สื่อความหมายชัดเจนขึ้น
    return new Response(
      JSON.stringify({ error: 'Invalid or missing date format. Please use YYYY-MM-DD (e.g., 2025-05-29).' }),
      { status: 400 } // Bad Request
    );
  }

  try {
    // Query ข้อมูลสรุปรวมจาก View ที่สร้างไว้
    const result = await db.query(
      `SELECT
    -- ส่วนนี้คือนับ "พนักงานทั้งหมด" ที่มีบันทึกใน vw_attendance_status
    -- จะเป็นผลรวมของ checkedIn, lateCount, และ notCheckedIn
    COUNT(DISTINCT vas.employeeid) AS "totalEmployees",

    -- นับพนักงานที่ไม่ซ้ำกันที่สแกนเข้าแล้ว
    COUNT(DISTINCT vas.employeeid) FILTER (WHERE status = 'scan')     AS "checkedIn",

    -- นับพนักงานที่ไม่ซ้ำกันที่มาสาย
    COUNT(DISTINCT vas.employeeid) FILTER (WHERE status = 'late')     AS "lateCount",

    -- นับพนักงานที่ไม่ซ้ำกันที่มีบันทึก 'noscan'
    COUNT(DISTINCT vas.employeeid) FILTER (WHERE status = 'noscan')   AS "notCheckedIn"
    FROM public.vw_attendance_status vas
    WHERE vas.accessdate = $1;
      `,
      [selectdate]
    );

    // 3. ส่งผลลัพธ์กลับไปในรูปแบบ JSON
    const rawSummary = result.rows[0] || {};

    const summary = {
      totalEmployees: parseInt(rawSummary.totalEmployees || '0', 10),
      checkedIn: parseInt(rawSummary.checkedIn || '0', 10),
      lateCount: parseInt(rawSummary.lateCount || '0', 10),
      notCheckedIn: parseInt(rawSummary.notCheckedIn || '0', 10),
    };

    return Response.json(summary);

  } catch (err) {
    // 4. จัดการข้อผิดพลาดที่เกิดขึ้น
    console.error('Error fetching attendance summary from view:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch attendance summary due to a server error.' }),
      { status: 500 } // Internal Server Error
    );
  }
}