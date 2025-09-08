import requests
import json

# 测试今日卡片 - 不带认证
BASE_URL = "http://localhost:8000/api"

# 先登录获取token
login_response = requests.post(f"{BASE_URL}/users/login", json={"code": "test123"})
print(f"登录响应: {login_response.status_code}")
if login_response.status_code == 200:
    token = login_response.json().get("data", {}).get("token")
    print(f"获取token: {token}")
    
    # 测试今日卡片
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/cards/daily", headers=headers)
    print(f"今日卡片响应: {response.status_code}")
    print(f"今日卡片内容: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
else:
    print("登录失败")