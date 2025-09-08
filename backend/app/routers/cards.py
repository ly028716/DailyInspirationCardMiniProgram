"""
卡片相关路由
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

from app.database import get_db
from app.models.card import Card
from app.models.favorite import Favorite
from app.models.user import User
from app.utils.ai_generator import generate_card_content
from app.utils.auth import get_current_user

router = APIRouter()


class CardResponse(BaseModel):
    id: int
    content: str
    type: str
    background_style: Optional[str] = None
    generate_date: date
    likes: int
    is_favorited: bool = False
    created_at: datetime


class GenerateRequest(BaseModel):
    type: str = "inspirational"  # inspirational, poetry, philosophy


class LikeRequest(BaseModel):
    action: str  # like, unlike


@router.get("/daily")
async def get_daily_card(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取今日卡片"""
    today = date.today()
    card = db.query(Card).filter(Card.generate_date == today).first()
    
    if not card:
        # 根据用户偏好生成卡片
        card_type = current_user.type_preference if current_user.type_preference != "all" else "inspirational"
        content = await generate_card_content(card_type)
        card = Card(
            content=content,
            type=card_type,
            generate_date=today
        )
        db.add(card)
        db.commit()
        db.refresh(card)
    
    # 检查是否已收藏
    is_favorited = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.card_id == card.id
    ).first() is not None
    
    card_dict = card.to_dict()
    card_dict["is_favorited"] = is_favorited
    
    return {
        "success": True,
        "message": "获取今日卡片成功",
        "data": card_dict
    }


@router.get("/{card_id}")
async def get_card_detail(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取卡片详情"""
    card = db.query(Card).filter(Card.id == card_id).first()
    
    if not card:
        raise HTTPException(status_code=404, detail="卡片不存在")
    
    # 检查是否已收藏
    is_favorited = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.card_id == card.id
    ).first() is not None
    
    card_dict = card.to_dict()
    card_dict["is_favorited"] = is_favorited
    
    return {
        "success": True,
        "message": "获取卡片详情成功",
        "data": card_dict
    }


@router.post("/generate")
async def generate_card(request: GenerateRequest, db: Session = Depends(get_db)):
    """生成新卡片"""
    try:
        content = await generate_card_content(request.type)
        
        card = Card(
            content=content,
            type=request.type,
            generate_date=date.today()
        )
        
        db.add(card)
        db.commit()
        db.refresh(card)
        
        return {
            "success": True,
            "message": "生成卡片成功",
            "data": card.to_dict()
        }
    
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}


@router.get("/history")
async def get_history_cards(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取历史卡片"""
    query = db.query(Card).order_by(Card.generate_date.desc())
    
    if type:
        query = query.filter(Card.type == type)
    
    offset = (page - 1) * limit
    cards = query.offset(offset).limit(limit).all()
    
    result = []
    for card in cards:
        card_dict = card.to_dict()
        is_favorited = db.query(Favorite).filter(
            Favorite.user_id == current_user.id,
            Favorite.card_id == card.id
        ).first() is not None
        card_dict["is_favorited"] = is_favorited
        result.append(card_dict)
    
    return {
        "success": True,
        "message": "获取历史卡片成功",
        "data": result
    }


@router.post("/{card_id}/favorite")
async def favorite_card(
    card_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """收藏卡片"""
    # 检查卡片是否存在
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        return {"success": False, "message": "卡片不存在", "data": None}
    
    # 检查是否已经收藏
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.card_id == card_id
    ).first()
    
    if existing:
        return {"success": False, "message": "已经收藏过了", "data": None}
    
    favorite = Favorite(user_id=current_user.id, card_id=card_id)
    db.add(favorite)
    
    # 更新用户收藏计数
    current_user.favorite_count += 1
    
    db.commit()
    
    return {"success": True, "message": "收藏成功", "data": None}


@router.delete("/{card_id}/favorite")
async def unfavorite_card(
    card_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """取消收藏"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.card_id == card_id
    ).first()
    
    if not favorite:
        return {"success": False, "message": "未找到收藏记录", "data": None}
    
    db.delete(favorite)
    
    # 更新用户收藏计数
    current_user.favorite_count = max(0, current_user.favorite_count - 1)
    
    db.commit()
    
    return {"success": True, "message": "取消收藏成功", "data": None}


@router.post("/{card_id}/like")
async def like_card(
    card_id: int,
    request: LikeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """点赞/取消点赞卡片"""
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        return {"success": False, "message": "卡片不存在", "data": None}
    
    if request.action == "like":
        card.likes += 1
        message = "点赞成功"
    elif request.action == "unlike":
        card.likes = max(0, card.likes - 1)
        message = "取消点赞成功"
    else:
        return {"success": False, "message": "无效的操作", "data": None}
    
    db.commit()
    
    return {
        "success": True,
        "message": message,
        "data": {"likes": card.likes}
    }


@router.get("/favorites")
async def get_favorites(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取收藏卡片"""
    offset = (page - 1) * limit
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).join(Card).order_by(Favorite.created_at.desc()).offset(offset).limit(limit).all()
    
    result = []
    for favorite in favorites:
        card_dict = favorite.card.to_dict()
        card_dict["is_favorited"] = True
        result.append(card_dict)
    
    return {
        "success": True,
        "message": "获取收藏卡片成功",
        "data": result
    }