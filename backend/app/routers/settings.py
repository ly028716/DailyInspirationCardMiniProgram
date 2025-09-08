"""
设置相关路由
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter()


class SettingsRequest(BaseModel):
    type_preference: Optional[str] = "all"
    auto_update: Optional[bool] = True
    push_time: Optional[str] = "08:00"


class SettingsResponse(BaseModel):
    type_preference: str
    auto_update: bool
    push_time: str
    message: str


@router.get("/preferences", response_model=SettingsResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户偏好设置"""
    return SettingsResponse(
        type_preference=current_user.type_preference,
        auto_update=current_user.auto_update,
        push_time=current_user.push_time,
        message="获取设置成功"
    )


@router.put("/preferences", response_model=SettingsResponse)
async def update_preferences(
    settings: SettingsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户偏好设置"""
    if settings.type_preference is not None:
        current_user.type_preference = settings.type_preference
    if settings.auto_update is not None:
        current_user.auto_update = settings.auto_update
    if settings.push_time is not None:
        current_user.push_time = settings.push_time
    
    db.commit()
    db.refresh(current_user)
    
    return SettingsResponse(
        type_preference=current_user.type_preference,
        auto_update=current_user.auto_update,
        push_time=current_user.push_time,
        message="设置更新成功"
    )


@router.get("/content-types")
async def get_content_types():
    """获取支持的内容类型"""
    return {
        "types": [
            {"value": "all", "label": "全部"},
            {"value": "inspirational", "label": "励志语录"},
            {"value": "poetry", "label": "现代诗歌"},
            {"value": "philosophy", "label": "哲理短文"}
        ]
    }


@router.get("/push-times")
async def get_push_times():
    """获取支持的推送时间"""
    return {
        "times": [
            {"value": "07:00", "label": "早上7点"},
            {"value": "08:00", "label": "早上8点"},
            {"value": "09:00", "label": "早上9点"},
            {"value": "12:00", "label": "中午12点"},
            {"value": "18:00", "label": "晚上6点"},
            {"value": "20:00", "label": "晚上8点"}
        ]
    }