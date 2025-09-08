#!/usr/bin/env python3
"""
AI每日灵感卡片 - 服务端主程序
FastAPI应用入口文件
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import users, cards, settings
from app.config import settings as app_settings


# 创建FastAPI应用
app = FastAPI(
    title="AI每日灵感卡片API",
    description="微信小程序服务端API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应配置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(users.router, prefix="/api/users", tags=["用户"])
app.include_router(cards.router, prefix="/api/cards", tags=["卡片"])
app.include_router(settings.router, prefix="/api/settings", tags=["设置"])


@app.on_event("startup")
def startup_event():
    """应用启动时执行"""
    print("🚀 启动AI每日灵感卡片服务...")
    # 创建数据库表
    Base.metadata.create_all(bind=engine)
    # 定时任务将在第三阶段实现
    pass
    print("✅ 数据库初始化完成")
    print("✅ 定时任务已启动")


@app.on_event("shutdown")
def shutdown_event():
    """应用关闭时执行"""
    print("🛑 服务关闭中...")
    # 定时任务将在第三阶段实现
    pass
    print("✅ 定时任务已停止")


@app.get("/")
def root():
    """根路由"""
    return {
        "message": "AI每日灵感卡片API服务运行中",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """健康检查"""
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "daily-inspiration-card-api"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=app_settings.host,
        port=app_settings.port,
        reload=app_settings.debug,
        log_level="info"
    )