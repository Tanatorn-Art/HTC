import { NextResponse } from 'next/server';
import db from '@/services/db';

export async function GET() {
    try {
        const result = await db.query(`
            SELECT d.name AS department, COUNT(e.id) AS count
            FROM departments d
            LEFT JOIN employees e ON e.department_id = d.id
            GROUP BY d.name
            ORDER BY d.name
          `);

          return NextResponse.json(result.rows);
    } catch (err) {
        console.error('Error in /department/summary:',err);
        return NextResponse.json({ error: 'Failed to fetch summary'}, {status: 500});
    }
}