const db = require('../services/db');

exports.getDetailedAttendance = async (req, res) => {
  try {
    const { date, departmentId, name } = req.query;

    const filters = [];
    const values = [];

    if (date) {
      filters.push(`workdate = $${values.length + 1}`);
      values.push(date);
    }

    if (departmentId) {
      filters.push(`deptcode = $${values.length + 1}`);
      values.push(departmentId);
    }

    if (name) {
      filters.push(`fullname ILIKE $${values.length + 1}`);
      values.push(`%${name}%`);
    }

    const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

    const query = `
      SELECT 
        deptcode,
        deptname,
        workdate,
        fullname,
        check_in,
        CASE WHEN checkin > '08:00' THEN true ELSE false END AS is_late
      FROM tbscantime_person
      ${whereClause}
      ORDER BY deptcode, fullname
    `;

    const { rows } = await db.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error('Error in getDetailedAttendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getFilteredAttendance = async (req, res) => {
  const { status } = req.query;
  const today = new Date().toISOString().slice(0, 10);

  let query = `
    SELECT 
      deptcode, deptname, fullname, check_in,
      CASE WHEN checkin > '08:00' THEN true ELSE false END AS is_late
    FROM tbscantime_person
    WHERE workdate = $1
  `;
  const values = [today];

  if (status === 'checked_in') {
    query += ' AND checkin IS NOT NULL';
  } else if (status === 'not_checked') {
    query += ' AND checkin IS NULL';
  } else if (status === 'late') {
    query += ` AND checkin > '08:00'`;
  }

  try {
    const { rows } = await db.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching filtered attendance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllAttendanceReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        deptcode, deptname, fullname, workdate, checkin AS checkinTime, checkout AS checkoutTime
      FROM tbscantime_person
      ORDER BY workdate DESC, deptcode
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
