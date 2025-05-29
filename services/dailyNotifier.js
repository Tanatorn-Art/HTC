const cron = require('node-cron');
const { getAbsentEmployees } = require('../services/notificationService');
const { sendWeComMessage } = require('../services/wecomService');

cron.schedule('0 8 * * *', async () => {
  const absentList = await getAbsentEmployees();

  const grouped = absentList.reduce((acc, emp) => {
    acc[emp.hod_wecom_id] = acc[emp.hod_wecom_id] || [];
    acc[emp.hod_wecom_id].push(`- ${emp.name} (${emp.department})`);
    return acc;
  }, {});

  for (const [hod, list] of Object.entries(grouped)) {
    const message = `พนักงานที่ยังไม่เข้าเช้านี้:\n` + list.join('\n');
    await sendWeComMessage(hod, message);
  }

  console.log('แจ้งเตือน WeCom ส่งสำเร็จ');
});
