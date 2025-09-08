// 主题管理工具类
// 提供主题切换和管理功能

// 主题配置
const THEME_CONFIG = {
  minimal: {
    name: '极简',
    primaryColor: '#667eea',
    backgroundColor: '#f5f7fa',
    textColor: '#2c3e50',
    cardBackground: '#ffffff',
    borderRadius: '12rpx',
    shadow: '0 2rpx 12rpx rgba(0,0,0,0.1)'
  },
  artistic: {
    name: '艺术',
    primaryColor: '#fa709a',
    backgroundColor: '#667eea',
    textColor: '#ffffff',
    cardBackground: 'rgba(255,255,255,0.1)',
    borderRadius: '20rpx',
    shadow: '0 4rpx 20rpx rgba(0,0,0,0.2)'
  },
  warm: {
    name: '温暖',
    primaryColor: '#ff9a9e',
    backgroundColor: '#fad0c4',
    textColor: '#8b4513',
    cardBackground: '#fff5f5',
    borderRadius: '16rpx',
    shadow: '0 3rpx 15rpx rgba(255,154,158,0.3)'
  }
}

// 主题管理器
class ThemeManager {
  constructor() {
    this.currentTheme = 'minimal'
    this.callbacks = []
    this.init()
  }

  // 初始化主题
  init() {
    // 从缓存读取主题
    const savedTheme = wx.getStorageSync('theme') || 'minimal'
    this.setTheme(savedTheme)
  }

  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme
  }

  // 获取主题配置
  getThemeConfig(themeName) {
    return THEME_CONFIG[themeName] || THEME_CONFIG.minimal
  }

  // 设置主题
  setTheme(themeName) {
    if (!THEME_CONFIG[themeName]) {
      console.warn(`主题 ${themeName} 不存在，使用默认主题`)
      themeName = 'minimal'
    }
    
    this.currentTheme = themeName
    
    // 保存到缓存
    wx.setStorageSync('theme', themeName)
    
    // 应用主题到页面
    this.applyTheme(themeName)
    
    // 触发回调
    this.triggerCallbacks(themeName)
  }

  // 应用主题样式
  applyTheme(themeName) {
    const config = this.getThemeConfig(themeName)
    
    // 设置导航栏颜色
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: config.primaryColor,
      animation: {
        duration: 300,
        timingFunc: 'easeIn'
      }
    })
    
    // 设置页面背景色
    this.setPageStyle(config)
  }

  // 设置页面样式
  setPageStyle(config) {
    // 动态设置页面样式（通过全局样式类）
    const style = `
      --primary-color: ${config.primaryColor};
      --background-color: ${config.backgroundColor};
      --text-color: ${config.textColor};
      --card-background: ${config.cardBackground};
      --border-radius: ${config.borderRadius};
      --shadow: ${config.shadow};
    `
    
    // 存储样式变量供页面使用
    wx.setStorageSync('theme_style', style)
  }

  // 获取主题样式类
  getThemeClass() {
    return `theme-${this.currentTheme}`
  }

  // 获取主题样式对象
  getThemeStyle() {
    const config = this.getThemeConfig(this.currentTheme)
    return {
      backgroundColor: config.backgroundColor,
      color: config.textColor
    }
  }

  // 获取卡片主题样式
  getCardThemeStyle() {
    const config = this.getThemeConfig(this.currentTheme)
    return {
      backgroundColor: config.cardBackground,
      borderRadius: config.borderRadius,
      boxShadow: config.shadow
    }
  }

  // 获取可用主题列表
  getAvailableThemes() {
    return Object.keys(THEME_CONFIG).map(key => ({
      key,
      name: THEME_CONFIG[key].name,
      config: THEME_CONFIG[key]
    }))
  }

  // 监听主题变化
  onThemeChange(callback) {
    this.callbacks.push(callback)
  }

  // 移除主题变化监听
  offThemeChange(callback) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  // 触发主题变化回调
  triggerCallbacks(newTheme) {
    this.callbacks.forEach(callback => {
      if (typeof callback === 'function') {
        callback(newTheme)
      }
    })
  }

  // 切换主题
  toggleTheme() {
    const themes = Object.keys(THEME_CONFIG)
    const currentIndex = themes.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    this.setTheme(themes[nextIndex])
  }

  // 获取主题色板
  getColorPalette() {
    const config = this.getThemeConfig(this.currentTheme)
    return {
      primary: config.primaryColor,
      background: config.backgroundColor,
      text: config.textColor,
      card: config.cardBackground
    }
  }

  // 根据主题生成渐变背景
  getGradientBackground() {
    const config = this.getThemeConfig(this.currentTheme)
    
    const gradients = {
      minimal: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      artistic: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      warm: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    }
    
    return gradients[this.currentTheme] || gradients.minimal
  }

  // 获取主题对应的图标颜色
  getIconColor() {
    const config = this.getThemeConfig(this.currentTheme)
    return config.primaryColor
  }

  // 检查是否是深色主题
  isDarkTheme() {
    return ['artistic'].includes(this.currentTheme)
  }

  // 获取文本颜色（根据背景自动调整）
  getAdaptiveTextColor(backgroundColor) {
    // 简单的亮度判断
    const isDark = this.isDarkTheme()
    return isDark ? '#ffffff' : '#2c3e50'
  }
}

// 创建全局主题管理器实例
const theme = new ThemeManager()

// 导出供全局使用
module.exports = theme

// 如果需要兼容旧版本，也导出ThemeManager类
module.exports.ThemeManager = ThemeManager