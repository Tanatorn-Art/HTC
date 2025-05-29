const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/api/summary', async (req, res) => {
  const { date } = req.query;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!date || !dateRegex.test(String(date))) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  try {
    const result = await db.query(
      `
      SELECT 
        d.id AS deptcode,
        d.name AS deptname,
        COUNT(e.id) AS "countPerson",
        COUNT(a.check_in) AS "countScan",
        SUM(CASE WHEN a.check_in > '08:00:00' THEN 1 ELSE 0 END) AS "countLate",
        COUNT(e.id) - COUNT(a.check_in) AS "countNoScan"
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id
      LEFT JOIN attendance a ON a.employee_id = e.id AND a.date = $1
      GROUP BY d.id, d.name
      ORDER BY d.name
      `,
      [date]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;