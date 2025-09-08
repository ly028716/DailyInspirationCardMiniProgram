"""
配置文件
"""

import os
from typing import Optional


class Settings:
    """兼容Python 3.6的简单配置类"""
    
    def __init__(self):
        # 基础配置
        self.debug = os.getenv("DEBUG", "True").lower() == "true"
        self.secret_key = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
        self.host = os.getenv("HOST", "0.0.0.0")
        self.port = int(os.getenv("PORT", "8000"))
        
        # 数据库配置
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./daily_inspiration.db")
        
        # Redis配置
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        
        # 微信小程序配置
        self.wechat_app_id = os.getenv("WECHAT_APP_ID", "")
        self.wechat_app_secret = os.getenv("WECHAT_APP_SECRET", "")
        
        # 通义千问API配置
        self.dashscope_api_key = os.getenv("DASHSCOPE_API_KEY", "")
        self.qwen_base_url = os.getenv("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/api/v1")
        
        # JWT配置
        self.algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))
        
        # 内容生成配置
        self.content_types = ["inspirational", "poetry", "philosophy"]
        self.max_content_length = 500
        self.default_content_type = "inspirational"
        
        # 定时任务配置
        self.daily_card_time = os.getenv("DAILY_CARD_TIME", "08:00")
        self.daily_card_hour = 8
        self.daily_card_minute = 0


# 创建配置实例
settings = Settings()