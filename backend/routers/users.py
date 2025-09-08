from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
import httpx
import os

from models.database import get_db, User
from utils.auth import create_jwt_token, verify_jwt_token

router = APIRouter()

class LoginRequest(BaseModel):
    code: str

class LoginResponse(BaseModel):
    success: bool
    data: dict = None
    message: str = None

class UserProfile(BaseModel):
    nickname: str = None
    avatar: str = None
    preference_type: str = "all"

class UserResponse(BaseModel):
    id: int
    openid: str
    nickname: str
    avatar_url: str
    preference_type: str

# 微信小程序配置
WECHAT_APP_ID = os.getenv("WECHAT_APP_ID")
WECHAT_APP_SECRET = os.getenv("WECHAT_APP_SECRET")

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """微信小程序登录"""
    try:
        # 向微信服务器发起请求获取openid
        url = f"https://api.weixin.qq.com/sns/jscode2session"
        params = {
            "appid": WECHAT_APP_ID,
            "secret": WECHAT_APP_SECRET,
            "js_code": request.code,
            "grant_type": "authorization_code"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
            
        if "openid" not in data:
            return LoginResponse(success=False, message="微信登录失败")
            
        openid = data["openid"]
        
        # 查询或创建用户
        result = await db.execute(select(User).where(User.openid == openid))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(openid=openid)
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # 生成JWT token
        token = create_jwt_token(user.id)
        
        return LoginResponse(
            success=True,
            data={
                "openid": openid,
                "token": token,
                "userInfo": {
                    "id": user.id,
                    "nickname": user.nickname,
                    "avatarUrl": user.avatar_url,
                    "preferenceType": user.preference_type
                }
            }
        )
        
    except Exception as e:
        return LoginResponse(success=False, message=str(e))

@router.get("/profile", response_model=UserResponse)
async def get_profile(db: AsyncSession = Depends(get_db), user_id: int = Depends(verify_jwt_token)):
    """获取用户信息"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return UserResponse(
        id=user.id,
        openid=user.openid,
        nickname=user.nickname,
        avatar_url=user.avatar_url,
        preference_type=user.preference_type
    )

@router.put("/profile")
async def update_profile(
    profile: UserProfile,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(verify_jwt_token)
):
    """更新用户信息"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if profile.nickname:
        user.nickname = profile.nickname
    if profile.avatar:
        user.avatar_url = profile.avatar
    if profile.preference_type:
        user.preference_type = profile.preference_type
    
    await db.commit()
    await db.refresh(user)
    
    return {"success": True, "message": "用户信息更新成功"}

@router.get("/favorites")
async def get_favorites(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(verify_jwt_token)
):
    """获取用户收藏的卡片"""
    # 这里需要与cards表关联查询
    # 实现代码在后续开发中补充
    return {"favorites": []}