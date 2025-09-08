#!/usr/bin/env python3
"""
认证调试脚本
"""

import requests
import json

def test_auth():
    base_url = "http://localhost:8000/api"
    
    # 测试1: 无token访问需要认证的接口
    print("=== 测试1: 无token访问今日卡片 ===")
    try:
        response = requests.get(f"{base_url}/cards/daily")
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
    except Exception as e:
        print(f"错误: {e}")
    
    # 测试2: 登录获取token
    print("\n=== 测试2: 登录获取token ===")
    try:
        # 使用测试用的code
        login_data = {"code": "test_code_123"}
        response = requests.post(f"{base_url}/users/login", json=login_data)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        
        if response.status_code == 200 and response.json().get("success"):
            token = response.json()["data"]["token"]
            print(f"获取到的token: {token}")
            
            # 测试3: 使用token访问今日卡片
            print("\n=== 测试3: 使用token访问今日卡片 ===")
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{base_url}/cards/daily", headers=headers)
            print(f"状态码: {response.status_code}")
            print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
            
            # 测试4: 测试其他需要认证的接口
            print("\n=== 测试4: 测试用户信息接口 ===")
            response = requests.get(f"{base_url}/users/profile", headers=headers)
            print(f"状态码: {response.status_code}")
            print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
            
    except Exception as e:
        print(f"错误: {e}")

if __name__ == "__main__":
    test_auth()