import {NextApiRequest,NextApiResponse} from 'next';
import db from '@/services/db';

export default async function handler(req: NextApiRequest,res: NextApiResponse) {
    try{
        const today = new Date(). toISOString().split('T')[0];
        
        const result = await db.query (`
            SELECT d.name AS department, COUNT(a.id) AS checked_in
            FROM departments d
            JOIN employees e ON e.department_id = d.id
            LEFT JOIN attendance a ON a.employee_id = e.id
            WHERE a.date = $1 AND a.check_in IS NOT NULL
            GROUP BY d.name
            ORDER BY d.name;
          `, [today]);

          res.status(200).json(result.rows);
        } catch (err) {
          console.error('Donut Chart API Error:', err);
          res.status(500).json({ error: 'Failed to load data' });
    }
}