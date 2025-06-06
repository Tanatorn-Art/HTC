import { NextRequest } from 'next/server';
import db from '@/services/db';

// กำหนด Type ของข้อมูลที่คาดว่าจะได้รับจาก vw_manpower query
interface SummaryData {
  totalScanned: string;
  totalNotScanned: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // API นี้จะคาดหวัง parameter ชื่อ 'date'
  const date = searchParams.get('date'); 
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!date || !dateRegex.test(date)) {
    return new Response(
      JSON.stringify({ error: 'รูปแบบวันที่ไม่ถูกต้องหรือไม่ครบถ้วน โปรดใช้รูปแบบ ปี-เดือน-วัน (yyyy-mm-dd).' }),
      { status: 400 }
    );
  }

  try {
    const result = await db.query<SummaryData>(
      // *** ใช้ SQL Query ที่ดึงข้อมูลจาก public.vw_manpower ตามที่คุณต้องการ ***
      `SELECT
          COALESCE(SUM(countscan), 0) AS "totalScanned",      -- รวมจำนวนคนที่สแกนแล้วทั้งหมด (จากทุกแผนก)
          COALESCE(SUM(countnotscan), 0) AS "totalNotScanned" -- รวมจำนวนคนที่ยังไม่สแกนทั้งหมด (จากทุกแผนก)
       FROM
          public.vw_manpower
       WHERE
          workdate = $1;
      `,
      [date] // ใช้ 'date' ตรงนี้
    );

    const rawSummary = result.rows[0] || {};

    const summary = {
      // แปลงค่าที่ได้เป็นตัวเลข (ควรจะเป็นตัวเลขอยู่แล้วจาก COALESCE และ SUM)
      totalScanned: parseInt(rawSummary.totalScanned || '0', 10), 
      totalNotScanned: parseInt(rawSummary.totalNotScanned || '0', 10), 
    };

    return Response.json(summary);

  } catch (err: any) {
    console.error('Error fetching attendance summary from vw_manpower:', err);
    return new Response(
      JSON.stringify({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ขณะดึงข้อมูลสรุปการเข้างานจาก vw_manpower' }),
      { status: 500 }
    );
  }
}