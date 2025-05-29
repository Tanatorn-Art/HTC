import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/services/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await db.query('SELECT * FROM public.tbscantime_person WHERE workdate::date = CURRENT_DATE;', [today]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching department summary:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
