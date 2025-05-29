const db = require('../services/db');

exports.getDepartments = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, hod_wecom_id FROM departments ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

exports.updateHOD = async (req, res) => {
  const { id } = req.params;
  const { hod_wecom_id } = req.body;

  try {
    await db.query(
      'UPDATE departments SET hod_wecom_id = $1 WHERE id = $2',
      [hod_wecom_id, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update HOD' });
  }
};