from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc, func
from pydantic import BaseModel
from datetime import datetime, date
import os

from models.database import get_db, Card, Favorite, UserCardInteraction
from utils.auth import verify_jwt_token
from services.ai_generator import AIGeneratorService

router = APIRouter()

class CardResponse(BaseModel):
    id: int
    content: str
    type: str
    background_style: str
    generate_date: date
    likes_count: int
    is_favorite: bool = False
    is_liked: bool = False

class GenerateCardRequest(BaseModel):
    type: str = None  # motivational, poetry, philosophy

@router.get("/daily", response_model=CardResponse)
async def get_daily_card(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(verify_jwt_token)
):
    """获取今日卡片"""
    today = date.today()
    
    # 查询今日是否已生成卡片
    result = await db.execute(
        select(Card).where(Card.generate_date == today)
    )
    card = result.scalar_one_or_none()
    
    # 如果今日没有卡片，则生成一个
    if not card:
        ai_service = AIGeneratorService()
        card = await ai_service.generate_daily_card(db, user_id)
    
    # 检查用户是否已收藏和点赞
    is_favorite = await check_if_favorite(db, user_id, card.id)
    is_liked = await check_if_liked(db, user_id, card.id)
    
    return CardResponse(
        id=card.id,
        content=card.content,
        type=card.type,
        background_style=card.background_style,
        generate_date=card.generate_date,
        likes_count=card.likes_count,
        is_favorite=is_favorite,
        is_liked=is_liked
    )

@router.get("/history")
async def get_card_history(
    skip: int = 0,
    limit: int = 20,
    type: str = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(verify_jwt_token)
):
    """获取历史卡片"""
    query = select(Card).order_by(desc(Card.generate_date))
    
    if type and type != 'all':
        query = query.where(Card.type == type)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    cards = result.scalars().all()
    
    # 获取用户的收藏和点赞状态
    card_list = []
    for card in cards:
        is_favorite = await check_if_favorite(db, user_id, card.id)
        is_liked = await check_if_liked(db, user_id, card.id)
        
        card_list.append(CardResponse(
            id=card.id,
            content=card.content,
            type=card.type,
            background_style=card.background_style,
            generate_date=card.generate_date,
            likes_count=card.likes_count,
            is_favorite=is_favorite,
            is_liked=is_liked
        ))
    
    return {"cards": card_list, "total": len(card_list)}

@router.post("/generate")
async def generate_card(
    request: GenerateCardRequest = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(verify_jwt_token)
):
    """手动生成卡片（测试用）"""
    ai_service = AIGeneratorService()
    card_type = request.type if request else None
    
    card = await ai_service.generate_card(db, user_id, card_type)
    
    return {
        "success": True,
        "card": {
            "id": card.id,
            "content": card.content,
            "type": card.type,
            "background_style": card.background_style,
            "generate_date": card.generate_date
        }
    }

@router.post("/{card_id}/favorite")
async def toggle_favorite(
    card_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(verify_jwt_token)
):
    """切换收藏状态"""
    # 检查卡片是否存在
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalar_one_or_none()
    
    if not card:
        raise HTTPException(status_code=404, detail="卡片不存在")
    
    # 检查是否已收藏
    result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == user_id,
            Favorite.card_id == card_id
        )
    )
    favorite = result.scalar_one_or_none()
    
    if favorite:
        # 取消收藏
        await db.delete(favorite)
        is_favorite = False
    else:
        # 添加收藏
        new_favorite = Favorite(user_id=user_id, card_id=card_id)
        db.add(new_favorite)
        is_favorite = True
    
    await db.commit()
    
    return {"success": True, "is_favorite": is_favorite}

@router.post("/{card_id}/like")
async def toggle_like(
    card_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(verify_jwt_token)
):
    """切换点赞状态"""
    # 检查卡片是否存在
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalar_one_or_none()
    
    if not card:
        raise HTTPException(status_code=404, detail="卡片不存在")
    
    # 检查交互记录
    result = await db.execute(
        select(UserCardInteraction).where(
            UserCardInteraction.user_id == user_id,
            UserCardInteraction.card_id == card_id
        )
    )
    interaction = result.scalar_one_or_none()
    
    if interaction:
        # 切换点赞状态
        interaction.liked = not interaction.liked
        is_liked = interaction.liked
    else:
        # 创建新的交互记录
        new_interaction = UserCardInteraction(
            user_id=user_id,
            card_id=card_id,
            liked=True
        )
        db.add(new_interaction)
        is_liked = True
    
    # 更新点赞计数
    if is_liked:
        card.likes_count += 1
    else:
        card.likes_count = max(0, card.likes_count - 1)
    
    await db.commit()
    
    return {"success": True, "is_liked": is_liked, "likes_count": card.likes_count}

# 辅助函数
async def check_if_favorite(db: AsyncSession, user_id: int, card_id: int) -> bool:
    """检查用户是否已收藏卡片"""
    result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == user_id,
            Favorite.card_id == card_id
        )
    )
    return result.scalar_one_or_none() is not None

async def check_if_liked(db: AsyncSession, user_id: int, card_id: int) -> bool:
    """检查用户是否已点赞卡片"""
    result = await db.execute(
        select(UserCardInteraction).where(
            UserCardInteraction.user_id == user_id,
            UserCardInteraction.card_id == card_id,
            UserCardInteraction.liked == True
        )
    )
    interaction = result.scalar_one_or_none()
    return interaction is not None