// 小程序认证问题修复脚本
// 在微信开发者工具的控制台中运行

function debugAuth() {
    console.log("=== 小程序认证调试开始 ===");
    
    // 1. 检查当前token
    const token = wx.getStorageSync('token');
    console.log("当前token:", token ? "已存在" : "不存在");
    if (token) {
        console.log("token内容:", token.substring(0, 20) + "...");
    }
    
    // 2. 检查网络配置
    console.log("当前API基础URL:", "http://localhost:8000/api");
    console.log("⚠️ 注意：微信小程序不支持localhost，请使用IP地址");
    
    // 3. 提供修复方案
    console.log("=== 修复方案 ===");
    console.log("方案1：修改API基础URL");
    console.log("将 frontend/utils/api.js 中的 baseUrl 改为:");
    console.log("const baseUrl = 'http://YOUR_IP:8000/api'");
    console.log("其中 YOUR_IP 是你电脑的局域网IP地址");
    
    // 4. 获取局域网IP
    console.log("=== 获取局域网IP ===");
    console.log("在命令行运行: ipconfig");
    console.log("找到 IPv4 地址，例如: <YOUR_LAN_IP>");
    
    // 5. 检查微信小程序配置
    console.log("=== 微信小程序配置 ===");
    console.log("1. 登录微信公众平台");
    console.log("2. 开发 -> 开发设置 -> 服务器域名");
    console.log("3. 在 request合法域名 中添加: http://YOUR_IP:8000");
    
    // 6. 清除缓存重新登录
    console.log("=== 清除缓存 ===");
    console.log("wx.removeStorageSync('token')");
    console.log("然后重新启动小程序");
}

// 运行调试
debugAuth();

// 修复函数
function fixAuth() {
    // 清除旧token
    wx.removeStorageSync('token');
    
    // 显示提示
    wx.showModal({
        title: '认证修复',
        content: '请按以下步骤操作：\n1. 找到你的局域网IP\n2. 修改API配置\n3. 配置微信小程序域名',
        showCancel: false
    });
}

// 导出修复函数
module.exports = {
    debugAuth,
    fixAuth
};