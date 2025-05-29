import axios from 'axios';

async function getWeComToken(): Promise<{ access_token: string }> {
  const corpId = process.env.WECOM_CORP_ID;
  const corpSecret = process.env.WECOM_CORP_SECRET;

  if (!corpId || !corpSecret) {
    throw new Error('Missing WeCom credentials in environment variables');
  }

  const response = await axios.get(
    `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${corpSecret}`
  );

  if (response.status !== 200 || !response.data.access_token) {
    throw new Error('Failed to get WeCom token');
  }

  return response.data;
}

export async function sendWeComMessage(userId: string, message: string) {
  const token = await getWeComToken();

  const response = await axios.post(
    `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token.access_token}`,
    {
      touser: userId, 
      msgtype: 'text',
      agentid: process.env.WECOM_AGENT_ID, 
      text: {
        content: message,
      },
      safe: 0,
    }
  );

  if (response.status !== 200 || response.data.errcode !== 0) {
    throw new Error('Failed to send message via WeCom');
  }

  return response.data;
}

export async function fetchWeComUsers() {
  const token = await getWeComToken();

  const response = await axios.get(
    `https://qyapi.weixin.qq.com/cgi-bin/user/simplelist?department_id=1&access_token=${token.access_token}`
  );

  if (response.status !== 200 || response.data.errcode !== 0) {
    throw new Error('Failed to fetch WeCom users');
  }

  return response.data;
}