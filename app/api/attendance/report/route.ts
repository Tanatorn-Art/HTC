// app/api/attendance/report/route.ts
import { NextRequest } from 'next/server';
import db from '@/services/db'; // บริการเชื่อมต่อฐานข้อมูลของคุณ

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const departmentId = searchParams.get('departmentId'); // นี่คือ deptcode
    const employeeId = searchParams.get('employeeId'); // นี่คือ scanStatus: 'all', 'scanned', 'not_scanned'

    // ตรวจสอบว่ามี date หรือไม่
    if (!date) {
      return new Response(JSON.stringify({ error: 'Missing date' }), { status: 400 });
    }

    // เริ่มต้น Query ด้วย workdate
    let query = 'SELECT * FROM public.vw_manpower WHERE workdate = $1';
    const values: string[] = [date];
    let index = 2;

    // กรองตาม departmentId (deptcode) ถ้ามีการเลือก
    if (departmentId) {
      // *** แก้ไข: ใช้ deptcode ในการกรอง ***
      query += ` AND deptcode = $${index++}`;
      values.push(departmentId);
    }

    // กรองตาม employeeId (scanStatus) ถ้ามีการเลือก
    if (employeeId) {
      // *** แก้ไข: กรองตามสถานะการสแกน ***
      if (employeeId === 'scanned') {
        // เพิ่มเงื่อนไขสำหรับ 'สแกนแล้ว'
        query += ` AND countscan > 0`; // หรือตามเงื่อนไขที่คุณใช้ระบุว่า 'สแกนแล้ว'
      } else if (employeeId === 'not_scanned') {
        // เพิ่มเงื่อนไขสำหรับ 'ยังไม่สแกน'
        query += ` AND countnotscan > 0`; // หรือตามเงื่อนไขที่คุณใช้ระบุว่า 'ยังไม่สแกน'
      }
      // ถ้า employeeId เป็น 'all' ไม่ต้องเพิ่มเงื่อนไขใดๆ ใน SQL Query
    }

    // เพิ่ม ORDER BY ในตอนท้ายสุด
    query += ' ORDER BY deptname ASC';

    console.log('Executing Query:', query); // ช่วยในการ Debug
    console.log('With values:', values); // ช่วยในการ Debug

    const result = await db.query(query, values);
    return Response.json(result.rows);
  } catch (error) {
    // แสดง Error ที่ชัดเจนใน Server Console
    console.error('Failed to fetch report:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}