import { NextRequest, NextResponse } from 'next/server';
import db from '@/services/db';

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    for (const [deptId, wecomId] of Object.entries(body)) {
      await db.query(
        'UPDATE departments SET hod_wecom_id = $1 WHERE id = $2',
        [wecomId, deptId]
      );
    }

    return NextResponse.json({ message: 'Settings saved' });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
