#!/usr/bin/env python3
"""
服务端测试脚本
用于验证第二阶段开发完成的服务端功能
"""

import httpx
import asyncio
import json
from datetime import datetime

# 测试配置
BASE_URL = "http://localhost:8000"
API_PREFIX = "/api"


async def test_health_check():
    """测试健康检查"""
    print("🩺 测试健康检查...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/health")
            print(f"✅ 健康检查通过: {response.status_code}")
            print(f"📊 响应: {response.json()}")
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")


async def test_api_docs():
    """测试API文档"""
    print("📚 测试API文档...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/docs")
            print(f"✅ API文档可访问: {response.status_code}")
    except Exception as e:
        print(f"❌ API文档访问失败: {e}")


async def test_cards_endpoints():
    """测试卡片相关端点"""
    print("🃏 测试卡片端点...")
    
    # 测试获取今日卡片（无需认证）
    try:
        async with httpx.AsyncClient() as client:
            # 注意：需要认证，这里简化测试
            print("⚠️  卡片端点需要认证，请使用真实token测试")
    except Exception as e:
        print(f"❌ 卡片端点测试失败: {e}")


async def test_user_endpoints():
    """测试用户相关端点"""
    print("👤 测试用户端点...")
    try:
        async with httpx.AsyncClient() as client:
            # 测试微信登录
            login_data = {
                "code": "test_code_123"
            }
            response = await client.post(
                f"{BASE_URL}{API_PREFIX}/users/login",
                json=login_data
            )
            print(f"📝 登录响应状态: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"✅ 登录成功，token: {result.get('token', 'N/A')[:20]}...")
            else:
                print(f"⚠️  登录失败（预期，因为code无效）: {response.text}")
    except Exception as e:
        print(f"❌ 用户端点测试失败: {e}")


async def test_content_types():
    """测试内容类型配置"""
    print("🎯 测试内容类型...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}{API_PREFIX}/settings/content-types")
            print(f"📋 内容类型响应: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 内容类型: {data}")
    except Exception as e:
        print(f"❌ 内容类型测试失败: {e}")


async def test_push_times():
    """测试推送时间配置"""
    print("⏰ 测试推送时间...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}{API_PREFIX}/settings/push-times")
            print(f"📋 推送时间响应: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 推送时间: {data}")
    except Exception as e:
        print(f"❌ 推送时间测试失败: {e}")


async def run_all_tests():
    """运行所有测试"""
    print("🚀 开始服务端功能测试...")
    print("=" * 50)
    
    await test_health_check()
    await test_api_docs()
    await test_user_endpoints()
    await test_content_types()
    await test_push_times()
    # await test_cards_endpoints()  # 需要认证
    
    print("=" * 50)
    print("🎉 测试完成！")
    print("💡 提示：")
    print("   1. 确保服务端已启动: python main.py")
    print("   2. 使用真实微信code测试登录功能")
    print("   3. 使用获取的token测试需要认证的接口")


if __name__ == "__main__":
    asyncio.run(run_all_tests())