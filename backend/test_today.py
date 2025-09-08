import requests
import json
from datetime import datetime

# 测试今日卡片
BASE_URL = "http://localhost:8000/api"
import os
token = os.getenv("TEST_JWT_TOKEN", "REDACTED")

headers = {"Authorization": f"Bearer {token}"}

print(f"当前日期: {datetime.now().date()}")
response = requests.get(f"{BASE_URL}/cards/today", headers=headers)
print(f"今日卡片接口返回: {response.status_code}")
print(f"今日卡片响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")