import {NextResponse} from 'next/server';
import db from '@/services/db';

export async function GET() {
    try {
        const result = await db.query('SELECT * FROM public.vw_manpower_att_group');
        return NextResponse.json(result.rows);
    }catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch manpower data '}, {status: 500});
    }
}
