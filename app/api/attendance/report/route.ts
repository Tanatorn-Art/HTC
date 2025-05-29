import { NextRequest } from 'next/server';
import db from '@/services/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const departmentId = searchParams.get('departmentId');
    const employeeId = searchParams.get('employeeId');

    if (!date) {
      return new Response(JSON.stringify({ error: 'Missing date' }), { status: 400 });
    }

    let query = 'SELECT * FROM public.vw_manpower_att_group WHERE workdate = $1';
    const values: string[] = [date];
    let index = 2;

    if (departmentId) {
      query += ` AND deptcode = $${index++}`;
      values.push(departmentId);
    }

    if (employeeId) {
      query += ` AND empcode = $${index++}`;
      values.push(employeeId);
    }

    const result = await db.query(query, values);
    return Response.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
