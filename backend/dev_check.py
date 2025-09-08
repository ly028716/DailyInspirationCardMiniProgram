#!/usr/bin/env python3
"""
开发环境检查脚本
用于验证第二阶段服务端开发环境是否完整
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python():
    """检查Python环境"""
    print("🔍 检查Python环境...")
    
    # 检查Python版本
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    else:
        print(f"❌ Python版本过低，需要3.8+，当前: {version.major}.{version.minor}.{version.micro}")
        return False
    
    return True

def check_dependencies():
    """检查依赖安装情况"""
    print("📦 检查依赖...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic',
        'python-dotenv',
        'httpx',
        'PyJWT',
        'alembic'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - 未安装")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📥 需要安装缺失的依赖:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_project_structure():
    """检查项目结构"""
    print("🏗️  检查项目结构...")
    
    required_files = [
        'main.py',
        'app/__init__.py',
        'app/config.py',
        'app/database.py',
        'app/models/user.py',
        'app/models/card.py',
        'app/models/favorite.py',
        'app/routers/users.py',
        'app/routers/cards.py',
        'app/routers/settings.py',
        'app/utils/auth.py',
        'app/utils/ai_generator.py',
        'requirements.txt',
        'init_db.py',
        'test_server.py'
    ]
    
    missing_files = []
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - 缺失")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n⚠️  缺失文件: {len(missing_files)}个")
        return False
    
    return True

def check_env_file():
    """检查环境变量文件"""
    print("⚙️  检查环境配置...")
    
    env_file = '.env'
    
    if not os.path.exists(env_file):
        print(f"❌ {env_file} - 缺失")
        
        # 创建.env.example
        env_content = """# 数据库配置
DATABASE_URL=sqlite:///./app.db

# 微信配置
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret

# AI配置
DASHSCOPE_API_KEY=your_api_key

# JWT配置
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
"""
        
        with open('.env.example', 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("📝 已创建.env.example模板文件")
        return False
    else:
        print("✅ .env文件存在")
        return True

def check_database():
    """检查数据库"""
    print("🗄️  检查数据库...")
    
    db_file = 'app.db'
    if os.path.exists(db_file):
        size = os.path.getsize(db_file)
        print(f"✅ 数据库文件存在 ({size} bytes)")
        return True
    else:
        print("⚠️  数据库文件不存在，需要初始化")
        return False

def check_port_availability():
    """检查端口占用"""
    print("🔌 检查端口8000...")
    
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 8000))
        sock.close()
        
        if result == 0:
            print("⚠️  端口8000已被占用")
            return False
        else:
            print("✅ 端口8000可用")
            return True
    except Exception as e:
        print(f"❌ 检查端口失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 AI每日灵感卡片 - 开发环境检查")
    print("=" * 50)
    
    checks = [
        check_python,
        check_dependencies,
        check_project_structure,
        check_env_file,
        check_database,
        check_port_availability
    ]
    
    passed = 0
    failed = 0
    
    for check in checks:
        print()
        if check():
            passed += 1
        else:
            failed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 检查结果: 通过 {passed}/{len(checks)}")
    
    if failed == 0:
        print("🎉 开发环境检查通过！")
        print("💡 可以运行以下命令启动服务:")
        print("   Windows: run.bat")
        print("   Linux/Mac: python start_server.py")
        print("   或直接: python main.py")
    else:
        print("⚠️  请修复上述问题后再启动服务")
        print("📋 建议步骤:")
        print("   1. 安装缺失依赖: pip install -r requirements.txt")
        print("   2. 配置环境变量: 复制.env.example为.env并修改")
        print("   3. 初始化数据库: python init_db.py")

if __name__ == "__main__":
    main()