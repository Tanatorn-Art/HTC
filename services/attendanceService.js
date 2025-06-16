const db = require('./db');
const { z } = require('zod');

const attendanceFilterSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  departmentId: z.string().regex(/^\d+$/).optional(),
  name: z.string().max(100).optional(),
});

exports.getDetailedAttendance = async ({ date, departmentId, name }) => {
  try {
   
    const parsed = attendanceFilterSchema.parse({ date, departmentId, name });

    let conditions = [];
    let values = [];
    let idx = 1;

    if (parsed.date) {
      conditions.push(`DATE(a.check_in_time) = $${idx++}`);
      values.push(parsed.date);
    }

    if (parsed.departmentId) {
      conditions.push(`d.id = $${idx++}`);
      values.push(parsed.departmentId);
    }

    if (parsed.name) {
      conditions.push(`e.full_name ILIKE $${idx++}`);
      values.push(`%${parsed.name}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        e.employee_code, e.full_name AS name, d.name AS department,
        a.check_in_time, a.check_out_time
      FROM employees e
      LEFT JOIN attendance a ON a.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      ${whereClause}
      ORDER BY e.full_name ASC
    `;

    const { rows } = await db.query(query, values);
    return rows;

  } catch (error) {
    console.error('Error in getDetailedAttendance service:', error);
    throw new Error('Invalid attendance query or database error');
  }
};
