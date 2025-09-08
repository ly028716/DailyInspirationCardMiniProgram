// 个人中心页面逻辑 - 简化版
const tabBarUtils = require('../../utils/tabbar.js')

Page({
  data: {
    userInfo: {},
    stats: {
      totalCards: 0,
      favoriteCards: 0,
      consecutiveDays: 0,
      totalLikes: 0
    },
    achievements: [],
    currentTheme: 'minimal',
    appVersion: '1.0.0',
    showTransition: false,
    avatarAnimation: false,
    themeNames: {
      minimal: '简约主题',
      artistic: '艺术主题',
      vibrant: '活力主题'
    }
  },

  onLoad() {
    this.initializePage()
    this.loadUserInfoSilent()
    this.loadStats()
    this.loadAchievements()
  },

  onShow() {
    // 使用工具类更新TAB栏选中状态
    tabBarUtils.updateTabBar(this, 2)
    
    this.loadUserInfoSilent()
    this.loadStats()
  },

  // 页面初始化
  initializePage() {
    try {
      const appVersion = wx.getAccountInfoSync().miniProgram.version || '1.0.0'
      
      this.setData({ 
        currentTheme: 'minimal',
        appVersion,
        showTransition: true 
      })
      
      // 隐藏过渡动画
      setTimeout(() => {
        this.setData({ showTransition: false })
      }, 500)
    } catch (error) {
      console.error('页面初始化失败:', error)
    }
  },

  // 静默获取用户信息（不触发授权弹窗）
  loadUserInfoSilent() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const joinDate = wx.getStorageSync('user_join_date')
      const level = this.calculateUserLevel()
      
      if (userInfo && userInfo.nickName) {
        this.setData({ 
          userInfo: {
            ...userInfo,
            joinDate: joinDate || this.formatDate(new Date()),
            level: level
          }
        })
      }
    } catch (error) {
      console.error('静默加载用户信息失败:', error)
    }
  },

  // 获取用户信息 - 用户点击触发
  async onGetUserInfo() {
    try {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const joinDate = this.formatDate(new Date())
          
          this.setData({ 
            userInfo: {
              ...res.userInfo,
              joinDate,
              level: 'V1'
            },
            avatarAnimation: true
          })
          
          // 保存用户信息
          wx.setStorageSync('userInfo', res.userInfo)
          wx.setStorageSync('user_join_date', joinDate)
          
          // 动画效果
          setTimeout(() => {
            this.setData({ avatarAnimation: false })
          }, 600)
          
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
          })
        },
        fail: (error) => {
          console.error('获取用户信息失败:', error)
          
          if (error.errMsg && (error.errMsg.includes('deny') || error.errMsg.includes('cancel'))) {
            wx.showToast({
              title: '需要授权才能使用完整功能',
              icon: 'none',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            })
          }
        }
      })
    } catch (error) {
      console.error('获取用户信息异常:', error)
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      })
    }
  },

  // 加载统计数据
  loadStats() {
    try {
      // 从本地存储获取统计数据，如果没有则使用默认值
      const stats = wx.getStorageSync('user_stats') || {
        totalCards: 45,
        favoriteCards: 12,
        consecutiveDays: 7,
        totalLikes: 89
      }
      
      // 计算连续天数
      const lastActive = wx.getStorageSync('last_active_date')
      const today = new Date().toDateString()
      if (lastActive !== today) {
        wx.setStorageSync('last_active_date', today)
      }
      
      this.setData({ stats })
    } catch (error) {
      console.error('加载统计数据失败:', error)
      // 使用默认统计数据
      this.setData({
        stats: {
          totalCards: 45,
          favoriteCards: 12,
          consecutiveDays: 7,
          totalLikes: 89
        }
      })
    }
  },

  // 加载成就系统
  loadAchievements() {
    try {
      // 模拟成就数据
      const achievements = [
        { id: 1, name: '初次见面', icon: '🎉', unlocked: true },
        { id: 2, name: '收藏达人', icon: '❤️', unlocked: this.data.stats.favoriteCards >= 10 },
        { id: 3, name: '连续7天', icon: '🔥', unlocked: this.data.stats.consecutiveDays >= 7 },
        { id: 4, name: '点赞大师', icon: '👍', unlocked: this.data.stats.totalLikes >= 50 }
      ]
      
      this.setData({ achievements })
    } catch (error) {
      console.error('加载成就失败:', error)
    }
  },

  // 计算用户等级
  calculateUserLevel() {
    const stats = this.data.stats
    const totalScore = stats.totalCards + stats.favoriteCards * 2 + stats.totalLikes
    
    if (totalScore >= 200) return 'V4'
    if (totalScore >= 100) return 'V3'
    if (totalScore >= 50) return 'V2'
    return 'V1'
  },

  // 跳转到收藏页面
  onFavorites() {
    // 设置全局标记，表示要显示收藏页面
    wx.setStorageSync('show_favorites', true)
    
    wx.switchTab({
      url: '/pages/history/list',
      success: () => {
        // 跳转成功后的处理在历史页面的onShow中
      },
      fail: (error) => {
        console.error('跳转到收藏页面失败:', error)
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到历史页面
  onHistory() {
    wx.switchTab({
      url: '/pages/history/list'
    })
  },

  // 跳转到设置页面
  onSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 关于我们
  onAbout() {
    wx.showModal({
      title: '关于我们',
      content: 'AI每日灵感卡片小程序\n版本：1.0.0\n\n为您提供每日精选的灵感内容，让生活充满正能量。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 用户反馈
  onFeedback() {
    wx.showModal({
      title: '用户反馈',
      content: '感谢您的反馈！请通过以下方式联系我们：\n\n邮箱：feedback@example.com\n微信群：扫描二维码加入',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 主题切换
  onTheme() {
    const themes = ['minimal', 'artistic', 'vibrant']
    const currentIndex = themes.indexOf(this.data.currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    const newTheme = themes[nextIndex]
    
    this.setData({ currentTheme: newTheme })
    
    wx.showToast({
      title: `已切换到${this.data.themeNames[newTheme]}`,
      icon: 'success',
      duration: 1500
    })
  },

  // 显示成就详情
  onShowAchievement(e) {
    const achievementId = e.currentTarget.dataset.id
    const achievement = this.data.achievements.find(a => a.id === achievementId)
    
    if (achievement) {
      if (achievement.unlocked) {
        wx.showModal({
          title: achievement.name,
          content: `恭喜您获得"${achievement.name}"成就！`,
          showCancel: false,
          confirmText: '知道了'
        })
      } else {
        wx.showToast({
          title: '成就尚未解锁',
          icon: 'none'
        })
      }
    }
  },

  // 清除缓存
  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？此操作将删除本地存储的用户信息、统计数据等。',
      confirmText: '确定清除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
            
            this.setData({
              userInfo: {},
              stats: {
                totalCards: 0,
                favoriteCards: 0,
                consecutiveDays: 0,
                totalLikes: 0
              },
              achievements: []
            })
            
            wx.showToast({
              title: '缓存已清除',
              icon: 'success',
              duration: 2000
            })
            
            // 重新加载页面
            setTimeout(() => {
              this.onLoad()
            }, 2000)
          } catch (error) {
            console.error('清除缓存失败:', error)
            wx.showToast({
              title: '清除缓存失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 导航到首页
  onHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 格式化日期
  formatDate(date) {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
})