"""
AI每日灵感卡片 - 服务端应用
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from contextlib import asynccontextmanager
except ImportError:
    # Python 3.6-3.7 兼容性
    from typing import AsyncGenerator
    from contextlib import contextmanager
    
    @contextmanager
    def asynccontextmanager(func):
        return func

from app.config import settings
from app.database import engine
from app.models.user import Base


def lifespan(app: FastAPI):
    """应用生命周期管理 - 兼容旧版本Python"""
    # 启动时执行
    print("🚀 AI每日灵感卡片服务启动中...")
    
    # 创建数据库表
    Base.metadata.create_all(bind=engine)
    
    yield
    
    # 关闭时执行
    print("🛑 服务关闭中...")


def create_app() -> FastAPI:
    """创建FastAPI应用实例"""
    app = FastAPI(
        title="AI每日灵感卡片API",
        description="基于AI的每日灵感卡片小程序服务端",
        version="1.0.0",
        lifespan=lifespan
    )
    
    # 配置CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    return app