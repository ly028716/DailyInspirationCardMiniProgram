# 每日灵感卡片 - 服务端

## 项目概述

这是一个基于FastAPI的每日灵感卡片小程序服务端，提供用户管理、卡片生成、收藏管理等功能。

## 功能特性

### ✅ 第二阶段核心功能（已完成）

#### 1. 用户系统
- [x] 微信登录/注册
- [x] JWT认证
- [x] 用户信息管理
- [x] 用户偏好设置

#### 2. 卡片系统
- [x] 每日卡片生成
- [x] 多种内容类型（励志、诗歌、哲理）
- [x] 卡片历史记录
- [x] 卡片收藏/取消收藏
- [x] 卡片点赞/取消点赞

#### 3. 设置系统
- [x] 内容类型偏好设置
- [x] 推送时间设置
- [x] 自动更新开关

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # 主应用入口
│   ├── config.py              # 配置管理
│   ├── database.py            # 数据库连接
│   ├── models/                # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py           # 用户模型
│   │   ├── card.py           # 卡片模型
│   │   └── favorite.py       # 收藏模型
│   ├── routers/              # 路由模块
│   │   ├── __init__.py
│   │   ├── users.py          # 用户相关接口
│   │   ├── cards.py          # 卡片相关接口
│   │   └── settings.py       # 设置相关接口
│   ├── utils/                # 工具模块
│   │   ├── __init__.py
│   │   ├── auth.py           # 认证工具
│   │   └── ai_generator.py   # AI生成工具
│   └── services/             # 服务模块
│       ├── __init__.py
│       └── ai_generator.py   # AI生成服务
├── test_server.py            # 测试脚本
├── init_db.py               # 数据库初始化脚本
├── requirements.txt         # 依赖列表
└── README.md               # 项目文档
```

## API文档

> 安全提示：本文档中的域名/IP为示例占位，请勿在公开仓库泄露真实内网地址或密钥。对外请使用 HTTPS 与正式域名（如 https://api.example.com）。

启动服务后，可以访问：
- Swagger文档: https://api.example.com/docs
- ReDoc文档: https://api.example.com/redoc

### 主要接口

#### 用户相关
- `POST /api/users/login` - 微信登录
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新用户信息

#### 卡片相关
- `GET /api/cards/daily` - 获取今日卡片
- `POST /api/cards/{card_id}/favorite` - 收藏/取消收藏
- `POST /api/cards/{card_id}/like` - 点赞/取消点赞
- `GET /api/cards/favorites` - 获取收藏列表
- `GET /api/cards/history` - 获取历史卡片

#### 设置相关
- `GET /api/settings/preferences` - 获取用户偏好
- `PUT /api/settings/preferences` - 更新用户偏好
- `GET /api/settings/content-types` - 获取内容类型列表
- `GET /api/settings/push-times` - 获取推送时间列表

## 快速开始

### 1. 环境准备

确保已安装Python 3.8+，然后安装依赖：

```bash
pip install -r requirements.txt
```

### 2. 环境配置

创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL=sqlite:///./app.db

# 微信配置
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret

# AI配置
DASHSCOPE_API_KEY=your_api_key

# JWT配置
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 3. 初始化数据库

```bash
python init_db.py
```

### 4. 启动服务

```bash
python main.py
```

### 5. 测试功能

```bash
python test_server.py
```

## 开发说明

### 数据库模型

#### User（用户）
- id: 主键
- openid: 微信openid
- nickname: 昵称
- avatar_url: 头像URL
- type_preference: 内容类型偏好
- auto_update: 是否自动更新
- push_time: 推送时间
- favorite_count: 收藏数量
- created_at: 创建时间
- updated_at: 更新时间

#### Card（卡片）
- id: 主键
- content: 卡片内容
- type: 内容类型
- background_style: 背景样式
- generate_date: 生成日期
- likes: 点赞数
- created_at: 创建时间

#### Favorite（收藏）
- id: 主键
- user_id: 用户ID
- card_id: 卡片ID
- created_at: 收藏时间

### 内容类型

- `inspirational` - 励志语录
- `poetry` - 诗歌
- `philosophy` - 哲理

### 背景样式

- `gradient-blue` - 蓝色渐变
- `gradient-purple` - 紫色渐变
- `gradient-orange` - 橙色渐变
- `gradient-green` - 绿色渐变
- `gradient-pink` - 粉色渐变
- `gradient-dark` - 深色渐变
- `gradient-light` - 浅色渐变

## 测试数据

初始化脚本会创建：
- 1个测试用户
- 7张测试卡片（过去7天）
- 3个测试收藏

## 注意事项

1. 微信登录需要真实的微信小程序appid和secret
2. AI生成功能需要阿里云DashScope API密钥
3. 生产环境请使用更强的SECRET_KEY
4. 数据库文件默认保存在项目根目录的app.db

## 后续计划

### 第三阶段计划
- [ ] 定时任务（每日卡片生成）
- [ ] 推送服务（微信小程序订阅消息）
- [ ] 图片生成（卡片背景图）
- [ ] 数据统计和分析
- [ ] 缓存优化（Redis）

## 技术支持

如有问题，请通过以下方式联系：
- 邮箱：your-email@example.com
- 微信：your-wechat-id