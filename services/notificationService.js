const db = require('../db');

exports.getAbssentEmployeeds = async () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; 

    const query =`
    SELECT e.id, e.name, d.name AS department, d.hod_wecom_id
    FROM employees e
    JOIN departments d ON e.department_id = d.id
    LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = $1
    WHERE a.check_in IS NULL
  `;
  const {rows} = await db.query(query, [today]);
  return rows;
};