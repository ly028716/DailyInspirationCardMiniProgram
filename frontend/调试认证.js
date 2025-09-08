// 认证问题调试脚本
// 在微信开发者工具控制台运行

class AuthDebugger {
    constructor() {
        this.api = require('./utils/api')
        this.storage = require('./utils/storage')
    }

    // 检查当前认证状态
    async checkAuthStatus() {
        console.log("=== 认证状态检查 ===")
        
        // 1. 检查token
        const token = wx.getStorageSync('token')
        console.log("1. 当前token:", token ? "已存在" : "不存在")
        
        if (token) {
            console.log("   token长度:", token.length)
            console.log("   token前10位:", token.substring(0, 10) + "...")
        }

        // 2. 检查用户信息
        const userInfo = wx.getStorageSync('userInfo')
        console.log("2. 用户信息:", userInfo ? "已存在" : "不存在")
        
        // 3. 测试API连接
        console.log("3. 测试API连接...")
        try {
            const api = new this.api()
            const health = await api.request({
                url: '/health',
                method: 'GET'
            })
            console.log("   ✅ API连接正常", health)
        } catch (error) {
            console.error("   ❌ API连接失败", error)
        }

        // 4. 测试认证接口
        console.log("4. 测试认证接口...")
        try {
            const api = new this.api()
            const profile = await api.getUserProfile()
            console.log("   ✅ 认证接口正常", profile)
        } catch (error) {
            console.error("   ❌ 认证接口失败", error)
        }
    }

    // 重新登录
    async reLogin() {
        console.log("=== 重新登录 ===")
        
        try {
            // 1. 清除旧数据
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            console.log("1. 已清除旧token和用户信息")

            // 2. 获取微信登录码
            const loginResult = await new Promise((resolve, reject) => {
                wx.login({
                    success: resolve,
                    fail: reject
                })
            })
            
            console.log("2. 获取登录码:", loginResult.code)

            // 3. 调用登录API
            const api = new this.api()
            const result = await api.login(loginResult.code)
            console.log("3. 登录成功:", result)

            // 4. 保存token
            wx.setStorageSync('token', result.token)
            wx.setStorageSync('userInfo', result.user)
            console.log("4. 已保存新token和用户信息")

            wx.showToast({
                title: '登录成功',
                icon: 'success'
            })

        } catch (error) {
            console.error("登录失败", error)
            wx.showModal({
                title: '登录失败',
                content: error.message || '请检查网络连接',
                showCancel: false
            })
        }
    }

    // 检查网络配置
    checkNetworkConfig() {
        console.log("=== 网络配置检查 ===")
        
        // 1. 检查API配置
        const api = require('./utils/api')
        console.log("1. API基础URL:", api.baseUrl)

        // 2. 检查小程序配置
        console.log("2. 小程序配置检查...")
        
        // 检查request合法域名
        wx.getNetworkType({
            success: (res) => {
                console.log("   网络类型:", res.networkType)
            }
        })

        // 3. 测试网络连接
        wx.request({
            url: 'https://api.example.com/api/health',
            method: 'GET',
            success: (res) => {
                console.log("   ✅ 网络连接正常", res.statusCode)
            },
            fail: (err) => {
                console.error("   ❌ 网络连接失败", err)
            }
        })
    }

    // 一键修复
    async oneClickFix() {
        console.log("=== 一键修复认证问题 ===")
        
        try {
            // 1. 清除所有缓存
            wx.clearStorageSync()
            console.log("1. 已清除所有缓存")

            // 2. 重新登录
            await this.reLogin()
            
            // 3. 重新加载页面
            wx.reLaunch({
                url: '/pages/index/index'
            })

        } catch (error) {
            console.error("修复失败", error)
        }
    }

    // 测试卡片加载
    async testCardLoading() {
        console.log("=== 测试卡片加载 ===")
        
        try {
            const api = new this.api()
            const card = await api.getDailyCard()
            console.log("✅ 卡片加载成功", card)
            return card
        } catch (error) {
            console.error("❌ 卡片加载失败", error)
            throw error
        }
    }
}

// 使用示例
const authDebugger = new AuthDebugger()

// 快速检查
console.log("认证调试脚本已加载")
console.log("运行 authDebugger.checkAuthStatus() 检查认证状态")
console.log("运行 authDebugger.reLogin() 重新登录")
console.log("运行 authDebugger.oneClickFix() 一键修复")
console.log("运行 authDebugger.testCardLoading() 测试卡片加载")

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthDebugger
}