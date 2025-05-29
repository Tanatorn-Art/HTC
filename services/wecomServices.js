const db = require('./db');
const { sendWeComMessage } = require('../lib/wecom');
const axios = require('axios');


async function sendWeComScanNotification(employee) {
  const message = {
    touser: employee.wecom_id,
    msgtype: 'text',
    agentid: process.env.WECOM_AGENT_ID,
    text: {
      content: ` คุณ ${employee.name} ได้สแกนเวลา ${employee.type === 'in' ? 'เข้า' : 'ออก'} เวลา ${employee.time}`,
    },
    safe: 0,
  };

  try {
    const token = await getAccessToken(); 
    const res = await axios.post(
      `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`,
      message
    );
    return res.data;
  } catch (err) {
    console.error(' ส่ง WeCom แจ้งเตือนล้มเหลว:', err);
  }
}

const sendDailyWeComNotifications = async () => {
  const today = new Date().toISOString().slice(0, 10); 

  const result = await db.query(
    `
    SELECT 
      e.full_name,
      e.employee_code,
      d.name AS department_name,
      d.hod_wecom_id
    FROM employees e
    JOIN departments d ON e.department_id = d.id
    WHERE e.id NOT IN (
      SELECT employee_id FROM attendance WHERE date = $1
    )
    AND d.hod_wecom_id IS NOT NULL
  `,
    [today]
  );

  const notCheckedInList = result.rows;

  const grouped = {};

  notCheckedInList.forEach((emp) => {
    const hodId = emp.hod_wecom_id;
    if (!grouped[hodId]) {
      grouped[hodId] = {
        department: emp.department_name,
        employees: [],
      };
    }
    grouped[hodId].employees.push(`${emp.employee_code} ${emp.full_name}`);
  });

  for (const hodId in grouped) {
    const dept = grouped[hodId].department;
    const empList = grouped[hodId].employees;

    const message =
      ` รายงานพนักงานยังไม่เข้าแผนก ${dept} วันนี้:\n` +
      empList.map((e) => `- ${e}`).join('\n');

    await sendWeComMessage({
      to: hodId, 
      message,
    });
  }
};

module.exports = {
  sendDailyWeComNotifications,
  sendWeComScanNotification, 
};