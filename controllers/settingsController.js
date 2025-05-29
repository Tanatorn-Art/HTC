const db = require('../services/db');

exports.getDepartments = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM vw_department_settings ORDER BY department_name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error Fetching departments settingd:',error);
        res.ststus(500).json({ error: 'Failed to fetch settings' });
    }
};

exports.updateHodSettings = async (req,res) => {
    const updates = req.body;

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        for (const [departmentId, wecomId] of Object.entries(updates)) {
            await client.query(
                'UPDATE dapartments SET hod_wecom_id = $1 WHERE id $$2',
                [wecomId || null, departmentId]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'อัปเดตสำเร็จ' });
    } catch (error) {

    }

}