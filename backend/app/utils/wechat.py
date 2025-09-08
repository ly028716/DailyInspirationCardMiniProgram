"""
微信小程序工具类
"""

import httpx
from typing import Optional, Dict, Any
from app.config import settings


class WeChatClient:
    """微信小程序客户端"""
    
    def __init__(self):
        self.app_id = settings.wechat_app_id
        self.app_secret = settings.wechat_app_secret
        self.base_url = "https://api.weixin.qq.com"
    
    async def get_openid_by_code(self, code: str) -> Optional[str]:
        """通过code获取openid"""
        
        if not self.app_id or not self.app_secret:
            print("⚠️ 微信配置未设置，使用模拟openid")
            return f"mock_openid_{hash(code) % 10000}"
        
        try:
            url = f"{self.base_url}/sns/jscode2session"
            params = {
                "appid": self.app_id,
                "secret": self.app_secret,
                "js_code": code,
                "grant_type": "authorization_code"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    openid = data.get("openid")
                    if openid:
                        return openid
                    else:
                        print(f"微信API返回错误: {data}")
                        return None
                else:
                    print(f"微信API调用失败: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"微信API调用异常: {e}")
            return None
    
    async def get_user_info(self, access_token: str, openid: str) -> Optional[Dict[str, Any]]:
        """获取用户信息"""
        try:
            url = f"{self.base_url}/sns/userinfo"
            params = {
                "access_token": access_token,
                "openid": openid
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"获取用户信息失败: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"获取用户信息异常: {e}")
            return None


# 创建全局实例
wechat_client = WeChatClient()


async def get_openid_by_code(code: str) -> Optional[str]:
    """通过code获取openid的快捷函数"""
    return await wechat_client.get_openid_by_code(code)