"""
卡片模型
"""

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Card(Base):
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    type = Column(String(20), nullable=False)  # inspirational, poetry, philosophy
    background_style = Column(String(50), nullable=True)
    generate_date = Column(Date, nullable=False)
    likes = Column(Integer, default=0)
    is_generated = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    favorites = relationship("Favorite", back_populates="card")
    
    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "type": self.type,
            "background_style": self.background_style,
            "generate_date": self.generate_date.isoformat() if self.generate_date else None,
            "likes": self.likes,
            "is_generated": self.is_generated,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }