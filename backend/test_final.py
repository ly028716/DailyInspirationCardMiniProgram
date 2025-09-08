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
    login_result = response.json()
    print(f"登录接口响应: {json.dumps(login_result, indent=2, ensure_ascii=False)}")
    
    if response.status_code == 200:
        token = login_result.get("data", {}).get("token")
        print(f"✅ 获取到token: {token}")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # 测试获取用户信息
        response = requests.get(f"{BASE_URL}/users/profile", headers=headers)
        print(f"\n用户信息接口返回: {response.status_code}")
        print(f"用户信息响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        # 测试获取历史卡片
        response = requests.get(f"{BASE_URL}/cards/history", headers=headers)
        print(f"\n历史卡片接口返回: {response.status_code}")
        print(f"历史卡片响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        # 测试生成新卡片
        response = requests.post(f"{BASE_URL}/cards/generate", headers=headers, json={})
        print(f"\n生成卡片接口返回: {response.status_code}")
        print(f"生成卡片响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        # 再次测试今日卡片
        response = requests.get(f"{BASE_URL}/cards/today", headers=headers)
        print(f"\n今日卡片接口返回: {response.status_code}")
        print(f"今日卡片响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        print("\n✅ 所有API接口测试完成！")
    else:
        print("❌ 登录失败")
        
except Exception as e:
    print(f"❌ 测试失败: {e}")