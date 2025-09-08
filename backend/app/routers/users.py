"""
用户相关路由
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.favorite import Favorite
from app.utils.wechat import get_openid_by_code
from app.utils.auth import create_access_token, get_current_user

router = APIRouter()


class LoginRequest(BaseModel):
    code: str


class LoginResponse(BaseModel):
    openid: str
    token: str
    user_info: dict


class UserProfile(BaseModel):
    nickname: str
    avatar: str


class UserPreferences(BaseModel):
    type_preference: Optional[str] = "all"
    auto_update: Optional[bool] = True
    push_time: Optional[str] = "08:00"


class UserStats(BaseModel):
    total_cards: int
    favorite_count: int
    consecutive_days: int
    total_likes: int


@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """微信登录"""
    try:
        # 通过code获取openid
        openid = await get_openid_by_code(request.code)
        if not openid:
            return {"success": False, "message": "无效的登录凭证", "data": None}
        
        # 查找或创建用户
        user = db.query(User).filter(User.openid == openid).first()
        if not user:
            user = User(openid=openid)
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # 生成JWT token
        token = create_access_token(data={"user_id": str(user.id)})
        
        return {
            "success": True,
            "message": "登录成功",
            "data": {
                "openid": openid,
                "token": token,
                "user_info": user.to_dict()
            }
        }
    
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}


@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """获取用户信息"""
    return {
        "success": True,
        "message": "获取用户信息成功",
        "data": current_user.to_dict()
    }


@router.put("/profile")
async def update_profile(
    profile: UserProfile, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户信息"""
    if profile.nickname:
        current_user.nickname = profile.nickname
    if profile.avatar:
        current_user.avatar_url = profile.avatar
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "success": True,
        "message": "更新用户信息成功",
        "data": current_user.to_dict()
    }


@router.get("/preferences")
async def get_preferences(current_user: User = Depends(get_current_user)):
    """获取用户偏好设置"""
    return {
        "success": True,
        "message": "获取用户偏好设置成功",
        "data": {
            "type_preference": current_user.type_preference,
            "auto_update": current_user.auto_update,
            "push_time": current_user.push_time
        }
    }


@router.put("/preferences")
async def update_preferences(
    preferences: UserPreferences,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户偏好设置"""
    if preferences.type_preference is not None:
        current_user.type_preference = preferences.type_preference
    if preferences.auto_update is not None:
        current_user.auto_update = preferences.auto_update
    if preferences.push_time is not None:
        current_user.push_time = preferences.push_time
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "success": True,
        "message": "更新用户偏好设置成功",
        "data": {
            "type_preference": current_user.type_preference,
            "auto_update": current_user.auto_update,
            "push_time": current_user.push_time
        }
    }


@router.get("/favorites")
async def get_favorites(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户收藏列表"""
    offset = (page - 1) * limit
    
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).join(User).order_by(Favorite.created_at.desc()).offset(offset).limit(limit).all()
    
    return [favorite.card.to_dict() for favorite in favorites]


@router.get("/stats")
async def get_user_stats(current_user: User = Depends(get_current_user)):
    """获取用户统计数据"""
    return {
        "success": True,
        "message": "获取用户统计数据成功",
        "data": {
            "total_cards": current_user.total_cards,
            "favorite_count": current_user.favorite_count,
            "consecutive_days": current_user.consecutive_days,
            "total_likes": current_user.total_likes
        }
    }