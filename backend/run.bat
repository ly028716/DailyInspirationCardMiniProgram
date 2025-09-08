@echo off
echo 🚀 启动AI每日灵感卡片服务端...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装或未添加到PATH
    pause
    exit /b 1
)

REM 检查依赖是否安装
python -c "import fastapi" >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 安装依赖中...
    pip install -r requirements.txt
)

REM 检查数据库文件
if not exist app.db (
    echo 🗄️  初始化数据库...
    python init_db.py
)

echo.
echo ✅ 服务端启动中...
echo 🌐 访问地址: http://localhost:8000
echo 📚 API文档: http://localhost:8000/docs
echo.

REM 启动服务
python start_server.py

pause