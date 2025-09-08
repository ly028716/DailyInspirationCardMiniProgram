#!/usr/bin/env python3
"""
测试新的IP地址配置
"""

import requests
import json

def test_new_url():
    base_url = "https://api.example.com/api"
    
    print("=== 测试新的IP地址配置 ===")
    print(f"测试URL: {base_url}")
    
    # 测试1: 健康检查
    print("\n1. 健康检查...")
    try:
        response = requests.get(f"{base_url.replace('/api', '')}/health")
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            print("✅ 服务器正常运行")
            print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        else:
            print("❌ 服务器异常")
    except Exception as e:
        print(f"❌ 连接失败: {e}")
    
    # 测试2: 登录
    print("\n2. 测试登录...")
    try:
        login_data = {"code": "test_code_123"}
        response = requests.post(f"{base_url}/users/login", json=login_data)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 登录成功")
            token = data["data"]["token"]
            print(f"Token: {token}")
            
            # 测试3: 使用token访问今日卡片
            print("\n3. 测试今日卡片...")
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{base_url}/cards/daily", headers=headers)
            print(f"状态码: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ 今日卡片获取成功")
                print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
            else:
                print("❌ 今日卡片获取失败")
                print(f"错误: {response.text}")
                
        else:
            print("❌ 登录失败")
            print(f"错误: {response.text}")
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")
    
    print("\n=== 测试完成 ===")

if __name__ == "__main__":
    test_new_url()