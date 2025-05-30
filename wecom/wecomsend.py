import requests

CORP_ID = 'ww079b6b868ed626cb' 
CORP_SECRET = '8FZ5KdIZZDmyr7p3PSBMXwG_X_tyzQN0jSPLrKEQHRE'
AGENT_ID = 1000002 

def get_access_token(corp_id, corp_secret):
    url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken'
    params = {
        'corpid': corp_id,
        'corpsecret': corp_secret
    }
    response = requests.get(url, params=params, timeout=10)
    data = response.json()
    if data.get("errcode") == 0:
        return data['access_token']
    else:
        raise requests.exceptions.HTTPError(f"❌ Error getting access token: {data}")

def send_wecom_message(token, agent_id, touser, content):
    url = f'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token={token}'   
    headers = {'Content-Type': 'application/json'}
    payload = {
        "touser": touser,
        "msgtype": "text",
        "agentid": agent_id,
        "text": {
            "content": content
        },
        "safe": 0
    }
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    return response.json()

if __name__ == '__main__':
    try:
        # ดึง access token
        access_token = get_access_token(CORP_ID, CORP_SECRET)

        message_text = (
            "📋 face scan list\n"
            "➮ RICA : 1 Person\n"
            "◦ 70039xxx | xxxxxxxxxxx\n"
            "➮ Information Technology : 1 Person\n"
            "◦ 70036xxx | xxxxxxxxxxx"
        )

        # ส่งข้อความ
        result = send_wecom_message(
            access_token,
            AGENT_ID,
            "Ta135ta135@gmail.com",  
            message_text
        )

        # แสดงผลลัพธ์
        print("📤 WeCom Response:", result)

        if result.get("errcode") == 0:
            print("✅ ส่งข้อความสำเร็จ")
        else:
            print("❌ ส่งข้อความล้มเหลว:", result)

    except requests.exceptions.RequestException as e: 
        print(f"❌ เกิดข้อผิดพลาดด้านเครือข่ายหรือ HTTP: {e}")
    except KeyError as e:
        print(f"❌ เกิดข้อผิดพลาด KeyError: {e}")
    except ValueError as e:
        print(f"❌ เกิดข้อผิดพลาด ValueError: {e}")
    except TypeError as e:
        print(f"❌ เกิดข้อผิดพลาด TypeError: {e}")