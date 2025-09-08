import requests

# 测试生成卡片
BASE_URL = "http://localhost:8000/api"
import os
token = os.getenv("TEST_JWT_TOKEN", "REDACTED")

headers = {"Authorization": f"Bearer {token}"}
response = requests.post(f"{BASE_URL}/cards/generate", headers=headers, json={})
print(f"生成卡片返回: {response.status_code}")
print(f"生成卡片响应: {response.json()}")