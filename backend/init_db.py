#!/usr/bin/env python3
"""
数据库初始化脚本
用于初始化数据库和创建测试数据
"""

import os
import sys
import random
from datetime import date, timedelta

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.card import Card
from app.models.favorite import Favorite


def init_database():
    """初始化数据库"""
    print("🗄️  开始初始化数据库...")
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表创建完成")


def create_test_users():
    """创建测试用户"""
    db = SessionLocal()
    try:
        print("👤 创建测试用户...")
        
        # 检查是否已有用户
        user_count = db.query(User).count()
        if user_count > 0:
            print("⚠️  用户已存在，跳过创建")
            return
        
        # 创建测试用户
        test_user = User(
            openid="test_openid_123456",
            nickname="测试用户",
            avatar_url="https://example.com/avatar.jpg",
            type_preference="all",
            auto_update=True,
            push_time="08:00"
        )
        
        db.add(test_user)
        db.commit()
        print(f"✅ 测试用户创建完成: {test_user.id}")
        
    except Exception as e:
        print(f"❌ 创建测试用户失败: {e}")
        db.rollback()
    finally:
        db.close()


def create_test_cards():
    """创建测试卡片"""
    db = SessionLocal()
    try:
        print("🃏 创建测试卡片...")
        
        # 检查是否已有卡片
        card_count = db.query(Card).count()
        if card_count > 0:
            print("⚠️  卡片已存在，跳过创建")
            return
        
        # 创建过去7天的测试卡片
        today = date.today()
        content_types = ["inspirational", "poetry", "philosophy"]
        sample_contents = {
            "inspirational": [
                "今天的努力，是明天的实力。",
                "每一次坚持，都是在为梦想铺路。",
                "相信自己，你比想象中更强大。",
                "生活不会辜负每一个努力的人。",
                "梦想不会逃跑，逃跑的永远是自己。",
                "把握现在，创造未来。",
                "成功不是偶然，是日复一日的坚持。"
            ],
            "poetry": [
                "风很轻，云很淡，\n心很静，梦很远。",
                "把每一天都过成诗，\n把每一步都走成歌。",
                "阳光正好，微风不燥，\n人间值得。",
                "心中有光，\n眼里有诗。",
                "岁月静好，\n现世安稳。",
                "时光不语，\n静待花开。",
                "愿你眼中有光，\n心中有爱。"
            ],
            "philosophy": [
                "人生最精彩的不是实现梦想的瞬间，而是坚持梦想的过程。",
                "有时候，放下不是失去，而是另一种获得。",
                "简单生活，快乐当下。",
                "心若向阳，无畏悲伤。",
                "人生最美的风景，是内心的淡定与从容。",
                "真正的成长，是学会与自己和解。",
                "生活不是等待风暴过去，而是学会在雨中起舞。"
            ]
        }
        
        for i in range(7):
            card_date = today - timedelta(days=i)
            card_type = content_types[i % len(content_types)]
            content = sample_contents[card_type][i % len(sample_contents[card_type])]
            
            card = Card(
                content=content,
                type=card_type,
                background_style=f"gradient-{['blue', 'purple', 'orange', 'green', 'pink', 'dark', 'light'][i % 7]}",
                generate_date=card_date,
                likes=random.randint(10, 100)
            )
            
            db.add(card)
        
        db.commit()
        print(f"✅ 测试卡片创建完成: 7张")
        
    except Exception as e:
        print(f"❌ 创建测试卡片失败: {e}")
        db.rollback()
    finally:
        db.close()


def create_test_favorites():
    """创建测试收藏"""
    db = SessionLocal()
    try:
        print("⭐ 创建测试收藏...")
        
        # 获取测试用户
        test_user = db.query(User).filter(User.openid == "test_openid_123456").first()
        if not test_user:
            print("❌ 测试用户不存在")
            return
        
        # 获取卡片
        cards = db.query(Card).limit(3).all()
        
        # 创建收藏
        for card in cards:
            # 检查是否已收藏
            existing = db.query(Favorite).filter(
                Favorite.user_id == test_user.id,
                Favorite.card_id == card.id
            ).first()
            
            if not existing:
                favorite = Favorite(user_id=test_user.id, card_id=card.id)
                db.add(favorite)
                test_user.favorite_count += 1
        
        db.commit()
        print(f"✅ 测试收藏创建完成: {test_user.favorite_count}个")
        
    except Exception as e:
        print(f"❌ 创建测试收藏失败: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """主函数"""
    print("🚀 开始数据库初始化...")
    print("=" * 50)
    
    # 初始化数据库
    init_database()
    
    # 创建测试数据
    create_test_users()
    create_test_cards()
    create_test_favorites()
    
    print("=" * 50)
    print("✅ 数据库初始化完成！")
    print("💡 现在可以启动服务端: python main.py")
    print("🧪 然后运行测试脚本: python test_server.py")


if __name__ == "__main__":
    main()