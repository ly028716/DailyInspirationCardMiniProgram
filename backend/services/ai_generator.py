import httpx
import os
import json
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
import random

from app.models.card import Card
from app.models.user import User

class AIGeneratorService:
    def __init__(self):
        self.api_key = os.getenv("DASHSCOPE_API_KEY", "")
        self.base_url = os.getenv("DASHSCOPE_BASE_URL", "https://dashscope.aliyuncs.com/api/v1")
        self.model = "qwen-turbo"
        
        # 内容类型配置
        self.content_types = {
            "motivational": {
                "name": "励志语录",
                "prompt": "生成一句简短有力的励志语录，50字以内，积极向上，富有启发性",
                "examples": [
                    "今天的努力，是明天的实力。",
                    "每一次坚持，都是在为梦想铺路。",
                    "相信自己，你比想象中更强大。"
                ]
            },
            "poetry": {
                "name": "现代诗歌",
                "prompt": "创作一首简短优美的现代诗歌，2-4行，富有意境和美感",
                "examples": [
                    "风很轻，云很淡，\n心很静，梦很远。",
                    "把每一天都过成诗，\n把每一步都走成歌。"
                ]
            },
            "philosophy": {
                "name": "哲理短文",
                "prompt": "写一句富有哲理的人生感悟，简短深刻，引发思考",
                "examples": [
                    "人生最精彩的不是实现梦想的瞬间，而是坚持梦想的过程。",
                    "有时候，放下不是失去，而是另一种获得。"
                ]
            }
        }
        
        # 背景样式
        self.background_styles = [
            "gradient-blue", "gradient-purple", "gradient-orange", 
            "gradient-green", "gradient-pink", "gradient-dark"
        ]

    async def generate_daily_card(self, db: AsyncSession, user_id: int) -> Card:
        """生成每日卡片"""
        today = date.today()
        
        # 获取用户偏好
        user = await self.get_user_preference(db, user_id)
        card_type = self.determine_card_type(user)
        
        # 生成内容
        content = await self.generate_content(card_type)
        background_style = random.choice(self.background_styles)
        
        # 创建卡片
        card = Card(
            content=content,
            type=card_type,
            background_style=background_style,
            generate_date=today
        )
        
        db.add(card)
        await db.commit()
        await db.refresh(card)
        
        return card

    async def generate_card(self, db: AsyncSession, user_id: int, card_type: str = None) -> Card:
        """手动生成卡片"""
        if not card_type:
            card_type = random.choice(list(self.content_types.keys()))
        
        content = await self.generate_content(card_type)
        background_style = random.choice(self.background_styles)
        
        card = Card(
            content=content,
            type=card_type,
            background_style=background_style,
            generate_date=date.today()
        )
        
        db.add(card)
        await db.commit()
        await db.refresh(card)
        
        return card

    async def generate_content(self, content_type: str) -> str:
        """调用AI生成内容"""
        if content_type not in self.content_types:
            content_type = "motivational"
            
        type_config = self.content_types[content_type]
        
        # 构建提示词
        prompt = f"""
        你是一个富有洞察力的生活哲学家和诗人。
        任务：{type_config['prompt']}
        
        要求：
        1. 简短精炼，不超过50字
        2. 语言优美，富有感染力
        3. 积极向上，给人力量
        4. 避免重复和俗套
        
        示例：
        {random.choice(type_config['examples'])}
        
        请生成新的内容：
        """

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "input": {
                "messages": [
                    {
                        "role": "system",
                        "content": "你是一个专业的文案创作者，擅长创作简短、优美、富有启发性的文字。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            },
            "parameters": {
                "result_format": "message",
                "max_tokens": 100,
                "temperature": 0.8,
                "top_p": 0.9
            }
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/services/aigc/text-generation/generation",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    content = data.get("output", {}).get("choices", [{}])[0].get("message", {}).get("content", "")
                    
                    # 清理内容
                    content = content.strip()
                    if len(content) > 50:
                        content = content[:47] + "..."
                    
                    return content
                else:
                    print(f"AI API调用失败: {response.status_code}")
                    return self.get_fallback_content(content_type)
                    
        except Exception as e:
            print(f"调用AI服务出错: {e}")
            return self.get_fallback_content(content_type)

    def get_fallback_content(self, content_type: str) -> str:
        """获取备用内容"""
        fallback_contents = {
            "motivational": [
                "每一个清晨，都是新的开始。",
                "今天的努力，是明天的礼物。",
                "相信自己，你能做到！"
            ],
            "poetry": [
                "阳光正好，微风不燥，\n人间值得。",
                "心中有光，\n眼里有诗。"
            ],
            "philosophy": [
                "简单生活，快乐当下。",
                "心若向阳，无畏悲伤。"
            ]
        }
        
        return random.choice(fallback_contents.get(content_type, ["保持热爱，奔赴山海。"]))

    async def get_user_preference(self, db: AsyncSession, user_id: int):
        """获取用户偏好"""
        from models.database import User
        
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        return user

    def determine_card_type(self, user) -> str:
        """根据用户偏好确定卡片类型"""
        if not user or user.preference_type == "all":
            return random.choice(list(self.content_types.keys()))
        
        return user.preference_type

    async def get_personalized_content(self, db: AsyncSession, user_id: int) -> str:
        """获取个性化内容（基于用户历史）"""
        # 获取用户最近的交互记录
        result = await db.execute(
            select(UserCardInteraction)
            .where(UserCardInteraction.user_id == user_id)
            .order_by(desc(UserCardInteraction.created_at))
            .limit(10)
        )
        interactions = result.scalars().all()
        
        # 分析用户偏好（简化版）
        liked_types = {}
        for interaction in interactions:
            if interaction.liked:
                card = await db.get(Card, interaction.card_id)
                if card:
                    liked_types[card.type] = liked_types.get(card.type, 0) + 1
        
        # 根据偏好选择类型
        if liked_types:
            most_liked = max(liked_types, key=liked_types.get)
            return await self.generate_content(most_liked)
        else:
            return await self.generate_content("motivational")