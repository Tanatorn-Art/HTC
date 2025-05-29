const db = require('../services/db');
const { sendWeComMessage } = require('../services/wecomService');

exports.sendWeComMessageFromView = async (req, res ) => {
    try {
        const  result = await db.query('SELECT * FROM vw_wecom_message_target');

        const rows = result.rows;
        const responses = [];

        for (const row of rows) {
            const { to_user, message } = row;
            if (to_user && message) {
                const response = await sendWeComMessage(to_user, message);
                responses.push({ to_user, status: 'sent', response });
            }
        }

        res.json({ success: true, sent: responses.length, responses })
    } catch (err) {
        console.error('WeCom send failed from view:',err);
        res.status(500).json({ error: 'Wecom send failed'});
    }
  };