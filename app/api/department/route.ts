import db from '@/services/db';

export async function GET() {
  try {
    const result = await db.query('SELECT * FROM public.vw_manpower');
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (err) {
    console.error('Failed to fetch department:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}