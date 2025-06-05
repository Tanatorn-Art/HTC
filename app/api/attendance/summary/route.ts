import { NextRequest } from 'next/server';
import db from '@/services/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!date || !dateRegex.test(date)) {
    return new Response(JSON.stringify({ error: 'Invalid date' }), { status: 400 });
  }

  try {
    const result = await db.query('SELECT * FROM public.vw_manpower');

    return Response.json(result.rows);
  } catch (err) {
    console.error('Error fetching summary:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch summary' }), { status: 500 });
  }
}
