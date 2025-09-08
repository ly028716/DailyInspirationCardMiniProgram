"""
AI内容生成工具
"""

import httpx
import json
import random
from typing import Dict, Any
from app.config import settings


class AIGenerator:
    """AI内容生成器"""
    
    def __init__(self):
        self.api_key = settings.dashscope_api_key
        self.base_url = settings.qwen_base_url
        
    async def generate_content(self, content_type: str) -> str:
        """生成内容"""
        
        prompts = {
            "inspirational": """
            请生成一条简短的中文励志语录，要求：
            1. 积极向上，充满正能量
            2. 简短精炼，20-50字
            3. 富有哲理，能给人启发
            4. 适合制作成精美卡片分享
            请直接返回语录内容，不要添加其他说明。
            """,
            
            "poetry": """
            请创作一首简短的中文现代诗，要求：
            1. 意境优美，富有诗意
            2. 4-6行，每行10-20字
            3. 主题积极向上
            4. 适合制作成精美卡片分享
            请直接返回诗歌内容，不要添加其他说明。
            """,
            
            "philosophy": """
            请生成一段简短的中文哲理短文，要求：
            1. 富有哲理，引人深思
            2. 50-80字
            3. 语言优美，有文学性
            4. 适合制作成精美卡片分享
            请直接返回短文内容，不要添加其他说明。
            """
        }
        
        prompt = prompts.get(content_type, prompts["inspirational"])
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "qwen-turbo",
                "input": {
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                },
                "parameters": {
                    "result_format": "message",
                    "temperature": 0.8,
                    "max_tokens": 200
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/services/aigc/text-generation/generation",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result.get("output", {}).get("choices", [{}])[0].get("message", {}).get("content", "")
                    return content.strip()
                else:
                    print(f"AI API调用失败: {response.status_code}")
                    return self.get_fallback_content(content_type)
                    
        except Exception as e:
            print(f"AI内容生成错误: {e}")
            return self.get_fallback_content(content_type)
    
    def get_fallback_content(self, content_type: str) -> str:
        """获取备用内容"""
        fallback_contents = {
            "inspirational": [
                "每一个不曾起舞的日子，都是对生命的辜负。",
                "生活不是等待风暴过去，而是学会在雨中翩翩起舞。",
                "你现在的努力，是为了以后有更多的选择。",
                "梦想不会逃跑，逃跑的永远是自己。"
            ],
            "poetry": [
                "阳光穿过树叶的缝隙\n洒下斑驳的光影\n就像生活中的美好\n总是在不经意间出现",
                "清晨的第一缕阳光\n唤醒沉睡的梦想\n新的一天\n新的开始"
            ],
            "philosophy": [
                "人生就像一杯茶，不会苦一辈子，但总会苦一阵子。",
                "世界上最远的距离不是生与死，而是我站在你面前，你却不知道我爱你。",
                "生活就像海洋，只有意志坚强的人，才能到达彼岸。"
            ]
        }
        
        import random
        contents = fallback_contents.get(content_type, fallback_contents["inspirational"])
        return random.choice(contents)


# 创建全局实例
ai_generator = AIGenerator()


async def generate_card_content(content_type: str) -> str:
    """生成卡片内容的快捷函数"""
    return await ai_generator.generate_content(content_type)