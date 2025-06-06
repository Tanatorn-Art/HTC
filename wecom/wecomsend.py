import psycopg2
import requests
from datetime import datetime

#WeCom Credentials
CORP_ID = 'ww079b6b868ed626cb'
CORP_SECRET = '8FZ5KdIZZDmyr7p3PSBMXwG_X_tyzQN0jSPLrKEQHRE'
AGENT_ID = 1000002

#PostgreSQL Connection
DB_CONFIG = {
    'host': '10.35.10.14',
    'port': '5432',
    'dbname': '********',
    'user': '******',
    'password': '********'
}

#ดึง access token
def get_access_token(corp_id, corp_secret):
    url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken'
    params = {'corpid': corp_id, 'corpsecret': corp_secret}
    response = requests.get(url, params=params, timeout=10)
    data = response.json()
    if data.get("errcode") == 0:
        return data['access_token']
    else:
        raise Exception(f"❌ Error getting token: {data}")

#ส่งข้อความเข้า WeCom
def send_wecom_message(token, agent_id, touser, content):
    url = f'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token={token}'
    payload = {
        "touser": touser,
        "msgtype": "text",
        "agentid": agent_id,
        "text": {"content": content},
        "safe": 0
    }
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    return response.json()

#ดึงรายชื่อพนักงานที่ยังไม่เเสกน
def fetch_absent_by_department():
    today = datetime.now().date()
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    query = """
        SELECT
            d.name AS dept_name,
            d.hod_userid,
            p.emp_code,
            p.emp_name
        FROM
            tbperson p
        JOIN
            tbdepartment d ON p.department_id = d.id
        WHERE
            p.active = true
            AND d.hod_userid IS NOT NULL
            AND p.emp_code NOT IN (
                SELECT emp_code
                FROM tbscantime
                WHERE scan_date = %s
            )
        ORDER BY d.name, p.emp_code
    """
    cur.execute(query, (today,))
    results = cur.fetchall()
    conn.close()

# Group by hod_userid
    grouped = {}
    for dept_name, hod_userid, emp_code, emp_name in results:
        if hod_userid not in grouped:
            grouped[hod_userid] = {'dept': dept_name, 'users': []}
        grouped[hod_userid]['users'].append(f"◦ {emp_code} | {emp_name}")

    return grouped

# ทำงานหลัก
if __name__ == '__main__':
    try:
        token = get_access_token(CORP_ID, CORP_SECRET)
        grouped_data = fetch_absent_by_department()
        today_str = datetime.now().strftime('%Y-%m-%d')

        for hod_userid, data in grouped_data.items():
            dept = data['dept']
            users = data['users']
            count = len(users)

            message = (
                f"📋 ไม่พบการสแกนเข้า - {today_str}\n"
                f"➮ แผนก {dept} : {count} คน\n" +
                "\n".join(users)
            )

            result = send_wecom_message(token, AGENT_ID, hod_userid, message)

            if result.get("errcode") == 0:
                print(f"✅ ส่งข้อความถึง {hod_userid} ({dept}) สำเร็จ")
            else:
                print(f"❌ ส่งข้อความถึง {hod_userid} ล้มเหลว: {result}")

    except Exception as e:
        print("❌ เกิดข้อผิดพลาด:", e)