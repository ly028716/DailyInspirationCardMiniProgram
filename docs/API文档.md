# AI每日灵感卡片API文档

## 基础信息
- **Base URL**: `https://api.example.com/api`
- **认证方式**: Bearer Token (JWT)
- **内容类型**: `application/json`

## 认证
所有需要认证的API都需要在Header中包含：
```
Authorization: Bearer <your_jwt_token>
```

## API端点

### 1. 用户管理

#### 1.1 微信小程序登录
**POST** `/users/login`

**请求参数**:
```json
{
  "code": "微信登录code"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "openid": "用户微信openid",
    "token": "JWT令牌",
    "userInfo": {
      "id": 1,
      "nickname": "用户昵称",
      "avatarUrl": "头像URL",
      "preferenceType": "all"
    }
  }
}
```

#### 1.2 获取用户信息
**GET** `/users/profile`

**响应示例**:
```json
{
  "id": 1,
  "openid": "用户微信openid",
  "nickname": "用户昵称",
  "avatar_url": "头像URL",
  "preference_type": "all"
}
```

#### 1.3 更新用户信息
**PUT** `/users/profile`

**请求参数**:
```json
{
  "nickname": "新昵称",
  "avatar": "新头像URL",
  "preference_type": "motivational"
}
```

### 2. 卡片管理

#### 2.1 获取今日卡片
**GET** `/cards/daily`

**响应示例**:
```json
{
  "id": 1,
  "content": "今天的励志内容",
  "type": "motivational",
  "background_style": "gradient-blue",
  "generate_date": "2024-01-15",
  "likes_count": 42,
  "is_favorite": false,
  "is_liked": false
}
```

#### 2.2 获取历史卡片
**GET** `/cards/history`

**查询参数**:
- `skip` (可选): 跳过记录数，默认0
- `limit` (可选): 返回记录数，默认20
- `type` (可选): 卡片类型 (all/motivational/poetry/philosophy)

**响应示例**:
```json
{
  "cards": [
    {
      "id": 1,
      "content": "卡片内容",
      "type": "poetry",
      "background_style": "gradient-purple",
      "generate_date": "2024-01-15",
      "likes_count": 25,
      "is_favorite": true,
      "is_liked": true
    }
  ],
  "total": 50
}
```

#### 2.3 切换收藏状态
**POST** `/cards/{card_id}/favorite`

**响应示例**:
```json
{
  "success": true,
  "is_favorite": true
}
```

#### 2.4 切换点赞状态
**POST** `/cards/{card_id}/like`

**响应示例**:
```json
{
  "success": true,
  "is_liked": true,
  "likes_count": 43
}
```

#### 2.5 手动生成卡片（测试用）
**POST** `/cards/generate`

**请求参数** (可选):
```json
{
  "type": "philosophy"
}
```

**响应示例**:
```json
{
  "success": true,
  "card": {
    "id": 100,
    "content": "新生成的内容",
    "type": "philosophy",
    "background_style": "gradient-green",
    "generate_date": "2024-01-15"
  }
}
```

## 错误处理

### 错误响应格式
```json
{
  "detail": "错误描述"
}
```

### 常见错误码
- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `404`: 资源不存在
- `500`: 服务器内部错误

## 卡片类型说明

| 类型 | 描述 | 示例 |
|------|------|------|
| motivational | 励志语录 | "今天的努力，是明天的实力。" |
| poetry | 现代诗歌 | "风很轻，云很淡，\n心很静，梦很远。" |
| philosophy | 哲理短文 | "人生最精彩的不是实现梦想的瞬间，而是坚持梦想的过程。" |

## 背景样式

| 样式名称 | 描述 |
|----------|------|
| gradient-blue | 蓝色渐变背景 |
| gradient-purple | 紫色渐变背景 |
| gradient-orange | 橙色渐变背景 |
| gradient-green | 绿色渐变背景 |
| gradient-pink | 粉色渐变背景 |
| gradient-dark | 深色渐变背景 |

## 使用示例

### Python示例
```python
import requests

# 登录
response = requests.post('https://api.example.com/api/users/login', json={
    'code': '微信code'
})
token = response.json()['data']['token']

# 获取今日卡片
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('https://api.example.com/api/cards/daily', headers=headers)
daily_card = response.json()

# 收藏卡片
card_id = daily_card['id']
response = requests.post(f'https://api.example.com/api/cards/{card_id}/favorite', headers=headers)
```

### JavaScript/微信小程序示例
```javascript
// 获取今日卡片
wx.request({
  url: 'https://api.example.com/api/cards/daily',
  header: {
    'Authorization': `Bearer ${token}`
  },
  success: function(res) {
    console.log('今日卡片:', res.data);
  }
});
```

## 注意事项

1. **频率限制**: 手动生成卡片接口每分钟最多调用5次
2. **数据缓存**: 今日卡片会缓存24小时
3. **内容过滤**: 所有AI生成内容都会经过安全过滤
4. **用户隐私**: 严格遵守用户隐私保护政策