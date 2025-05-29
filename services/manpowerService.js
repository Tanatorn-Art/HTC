import db from './db';
// import { Manpower } from '@/types/manpower';

export async function getManpowerSummary() {
  try {
    const query = `
      SELECT
        sbu.name AS sbu,
        COUNT(e.id) AS current,]
        SUM(CASE WHEN e.type = 'SECTION THEN 1 ELSE 0 END) AS section,
        SUM(CASE WHEN e.type = 'HTC_TH' THEN 1 ELSE 0 END) AS htc_thai,
        SUM(CASE WHEN e.type = 'HTC_KH' THEN 1 ELSE 0 END) AS htc_kh,
        SUM(CASE WHEN e.type = 'SUB_TH' THEN 1 ELSE 0 END) AS sub_thai,
        SUM(CASE WHEN e.type = 'SUB_KH' THEN 1 ELSE 0 END) AS sub_kh,
        SUM(CASE WHEN e.type = 'HTC_HO' THEN 1 ELSE 0 END) AS htc_ho,
        SUM(CASE WHEN e.type = 'MGMT_HO' THEN 1 ELSE 0 END) AS management_ho,
        SUM(CASE WHEN e.type = 'FOREIGN_HO' THEN 1 ELSE 0 END) AS foreign_ho
      FROM employees e
      JOIN sbus sbu ON e.sbu_id = sbu.id
      WHERE e.deleted_at IS NULL
      GROUP BY sbu.name
      ORDER BY sbu.name
    `;

    const { rows } = await db.query(query);
    return rows;
  } catch (err) {
    console.error('Error fetching manpower summary:', {
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to fetch manpower summary. Please try again later.');
  }
}