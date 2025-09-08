import requests
import json

# 测试API接口
BASE_URL = "http://localhost:8000/api"

print("🧪 开始测试API接口...")

# 测试登录
try:
    login_data = {"code": "test123"}
    response = requests.post(f"{BASE_URL}/users/login", json=login_data)
    print(f"登录接口返回: {response.status_code}")
    print(f"登录接口响应: {response.json()}")
    
    if response.status_code == 200:
        token = response.json().get("data", {}).get("token")
        print(f"✅ 获取到token: {token}")
        
        # 测试获取用户信息
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/users/profile", headers=headers)
        print(f"用户信息接口返回: {response.status_code}")
        print(f"用户信息响应: {response.json()}")
        
        # 测试获取今日卡片
        response = requests.get(f"{BASE_URL}/cards/today", headers=headers)
        print(f"今日卡片接口返回: {response.status_code}")
        print(f"今日卡片响应: {response.json()}")
        
        print("✅ 所有API接口测试通过！")
    else:
        print("❌ 登录失败")
        
except Exception as e:
    print(f"❌ 测试失败: {e}")