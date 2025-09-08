"""
定时任务调度器
"""

import asyncio
import schedule
import time
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.card import Card
from app.utils.ai_generator import generate_card_content


class SchedulerManager:
    """定时任务管理器"""
    
    def __init__(self):
        self.is_running = False
    
    def schedule_daily_card(self):
        """安排每日卡片生成任务"""
        schedule.every().day.at("08:00").do(self.generate_daily_card)
        print("📅 已设置每日8:00自动生成卡片")
    
    def generate_daily_card(self):
        """生成每日卡片"""
        try:
            db = SessionLocal()
            
            # 检查今天是否已经生成过卡片
            today = date.today()
            existing_card = db.query(Card).filter(Card.generate_date == today).first()
            
            if existing_card:
                print(f"✅ {today} 的卡片已存在，跳过生成")
                return
            
            # 随机选择内容类型
            import random
            content_types = ["inspirational", "poetry", "philosophy"]
            content_type = random.choice(content_types)
            
            # 生成内容
            content = asyncio.run(generate_card_content(content_type))
            
            # 创建卡片
            card = Card(
                content=content,
                type=content_type,
                generate_date=today,
                is_generated=True
            )
            
            db.add(card)
            db.commit()
            db.refresh(card)
            
            print(f"🎉 成功生成 {today} 的每日卡片: {content[:50]}...")
            
        except Exception as e:
            print(f"❌ 生成每日卡片失败: {e}")
        finally:
            db.close()
    
    def run_scheduler(self):
        """运行调度器"""
        self.is_running = True
        print("🕐 定时任务调度器已启动")
        
        while self.is_running:
            schedule.run_pending()
            time.sleep(60)  # 每分钟检查一次
    
    def stop_scheduler(self):
        """停止调度器"""
        self.is_running = False
        schedule.clear()
        print("🛑 定时任务调度器已停止")


# 创建全局实例
scheduler_manager = SchedulerManager()


def start_scheduler():
    """启动定时任务"""
    scheduler_manager.schedule_daily_card()
    
    # 在后台线程中运行调度器
    import threading
    scheduler_thread = threading.Thread(target=scheduler_manager.run_scheduler, daemon=True)
    scheduler_thread.start()
    
    print("🚀 定时任务系统已启动")


def stop_scheduler():
    """停止定时任务"""
    scheduler_manager.stop_scheduler()


# 手动触发每日卡片生成（用于测试）
def generate_today_card():
    """手动生成今日卡片"""
    scheduler_manager.generate_daily_card()


if __name__ == "__main__":
    # 测试调度器
    print("🔧 测试定时任务...")
    generate_today_card()