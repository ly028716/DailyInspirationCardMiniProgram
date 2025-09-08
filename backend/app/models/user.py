"""
用户模型
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    openid = Column(String(100), unique=True, index=True, nullable=False)
    nickname = Column(String(50), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    preference_type = Column(String(20), default="all")
    type_preference = Column(String(20), default="all")  # all, inspirational, poetry, philosophy
    auto_update = Column(Boolean, default=True)
    push_time = Column(String(5), default="08:00")
    total_cards = Column(Integer, default=0)
    favorite_count = Column(Integer, default=0)
    consecutive_days = Column(Integer, default=0)
    total_likes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    favorites = relationship("Favorite", back_populates="user")
    
    def to_dict(self):
        return {
            "id": self.id,
            "openid": self.openid,
            "nickname": self.nickname,
            "avatar_url": self.avatar_url,
            "preference_type": self.preference_type,
            "type_preference": self.type_preference,
            "auto_update": self.auto_update,
            "push_time": self.push_time,
            "total_cards": self.total_cards,
            "favorite_count": self.favorite_count,
            "consecutive_days": self.consecutive_days,
            "total_likes": self.total_likes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }