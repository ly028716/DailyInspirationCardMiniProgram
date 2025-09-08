# AI每日灵感卡片小程序

一个基于微信小程序的AI每日灵感生成应用，每天为用户推送精选的励志语录、现代诗歌和哲理短文。

## 🌟 项目特色

- **AI智能生成**: 基于通义千问大模型，每日自动生成高质量内容
- **个性化推荐**: 根据用户偏好和历史行为智能推荐内容
- **精美设计**: 3套精美卡片模板，优雅的视觉体验
- **社交分享**: 支持一键分享到朋友圈，传递正能量
- **收藏管理**: 支持收藏喜欢的内容，随时回顾

## 🚀 技术架构

### 前端
- **平台**: 微信小程序
- **框架**: 微信小程序原生框架
- **UI库**: Vant Weapp组件库

### 后端
- **语言**: Python 3.9+
- **框架**: FastAPI (高性能异步框架)
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **AI模型**: 通义千问大模型API
- **部署**: Docker容器化

## 📁 项目结构

```
ai-daily-inspiration-cards/
├── frontend/                 # 微信小程序前端
│   ├── pages/
│   │   ├── index/          # 首页
│   │   ├── card/           # 卡片详情
│   │   ├── profile/        # 个人中心
│   │   └── settings/       # 设置页面
│   ├── components/         # 自定义组件
│   ├── utils/             # 工具函数
│   ├── assets/            # 静态资源
│   ├── app.js             # 小程序入口
│   └── app.json           # 小程序配置
├── backend/                  # Python后端服务
│   ├── app.py             # FastAPI主应用
│   ├── models/            # 数据模型
│   ├── routers/           # API路由
│   ├── services/          # 业务逻辑
│   ├── utils/             # 工具模块
│   ├── requirements.txt   # Python依赖
│   └── Dockerfile         # Docker配置
├── docs/                    # 项目文档
│   ├── 开发计划文档.md    # 详细开发计划
│   ├── API文档.md         # API接口文档
│   └── 部署指南.md        # 部署说明
└── README.md              # 项目说明
```

## 🎯 核心功能

### 用户功能
- [x] 微信一键登录
- [x] 个人偏好设置
- [x] 收藏管理
- [x] 浏览历史
- [x] 卡片分享

### 内容功能
- [x] 每日自动生成
- [x] 三种内容类型：励志/诗歌/哲理
- [x] 个性化推荐
- [x] 内容多样性保证

### 技术特性
- [x] RESTful API设计
- [x] JWT身份认证
- [x] 异步任务处理
- [x] 容器化部署
- [x] 数据缓存优化

## 🛠️ 快速开始

### 开发环境搭建

#### 1. 服务端启动
```bash
# 进入服务端目录
cd 服务端

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env文件，填入必要配置

# 启动服务
python app.py
```

#### 2. 小程序端配置
1. 打开微信开发者工具
2. 导入"小程序端"文件夹
3. 配置AppID和合法域名
4. 启动调试

### 生产环境部署

#### Docker部署
```bash
# 使用Docker Compose一键部署
cd 服务端
docker-compose up -d

# 查看服务状态
docker-compose ps
```

详细部署步骤请参考 [部署指南](文档/部署指南.md)

## 📖 文档索引

- 📋 [开发计划文档](文档/开发计划文档.md) - 详细的项目规划和开发阶段
- 🔌 [API文档](文档/API文档.md) - 完整的API接口说明
- 🚀 [部署指南](文档/部署指南.md) - 生产环境部署教程

## 🎨 界面预览

### 首页 - 每日灵感
- 展示今日AI生成的灵感卡片
- 支持左右滑动切换不同内容
- 优雅的加载动画和过渡效果

### 卡片详情
- 全屏展示卡片内容
- 支持收藏、点赞、分享
- 精美的背景渐变效果

### 个人中心
- 用户信息和偏好设置
- 收藏夹管理
- 浏览历史记录

## 🔧 技术栈详解

### 后端技术
- **FastAPI**: 现代、快速的Python Web框架
- **SQLAlchemy**: Python SQL工具包和ORM
- **Pydantic**: 数据验证和设置管理
- **JWT**: JSON Web Token身份认证
- **HTTPX**: 异步HTTP客户端
- **Alembic**: 数据库迁移工具

### 前端技术
- **微信小程序**: 原生小程序开发
- **Vant Weapp**: 轻量、可靠的小程序UI组件库
- **ES6+**: 现代JavaScript语法
- **Promise**: 异步操作管理

### 部署技术
- **Docker**: 容器化部署
- **Nginx**: 反向代理和负载均衡
- **Let's Encrypt**: 免费SSL证书
- **GitHub Actions**: CI/CD自动化

## 📊 性能优化

### 前端优化
- 图片懒加载
- 数据缓存策略
- 分包加载优化
- 骨架屏提升体验

### 后端优化
- Redis缓存热点数据
- 数据库查询优化
- API响应压缩
- 异步任务队列

## 🔒 安全考虑

- JWT Token身份认证
- HTTPS加密传输
- 输入数据验证
- SQL注入防护
- XSS攻击防护

## 📈 监控指标

- API响应时间 < 200ms
- 每日活跃用户
- 内容生成成功率 > 99%
- 用户留存率
- 卡片分享率

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [通义千问](https://tongyi.aliyun.com/) - 提供AI大模型支持
- [FastAPI](https://fastapi.tiangolo.com/) - 现代Web框架
- [Vant Weapp](https://youzan.github.io/vant-weapp/) - 小程序UI组件库

## 📞 联系方式

- 项目维护者：[Your Name](mailto:your.email@domain.com)
- 项目主页：https://github.com/your-username/ai-inspiration-cards
- 问题反馈：[Issues](https://github.com/your-username/ai-inspiration-cards/issues)

---

<div align="center">
  <p>⭐ 如果这个项目对你有帮助，请给它一个星标！</p>
  <p>💡 每天一点灵感，让生活更美好</p>
</div>