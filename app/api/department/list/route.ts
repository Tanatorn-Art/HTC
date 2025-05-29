import db from '@/services/db';

type DepartmentSummary = {
  id: number;
  name: string;
  employees: {
    id: number;
    name: string;
    wecom_id: string;
  }[];
};

export async function GET() {
  try {
    const result = await db.query('SELECT * FROM public.department_summary');

    const grouped: Record<string, DepartmentSummary> = {};

    for (const row of result.rows) {
      if (!grouped[row.department_id]) {
        grouped[row.department_id] = {
          id: row.department_id,
          name: row.department_name,
          employees: [],
        };
      }
      if (row.employee_id) {
        grouped[row.department_id].employees.push({
          id: row.employee_id,
          name: row.employee_name,
          wecom_id: row.wecom_id || '',
        });
      }
    }

    return Response.json(Object.values(grouped));
  } catch (err) {
    console.error('Error fetching department:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}
