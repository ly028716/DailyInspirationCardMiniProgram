// 首页逻辑 - 简化版
const tabBarUtils = require('../../utils/tabbar.js')

Page({
  data: {
    dailyCard: null,
    loading: false,
    refreshing: false
  },

  onLoad() {
    this.initializeApp()
  },

  onShow() {
    // 使用工具类更新TAB栏选中状态
    tabBarUtils.updateTabBar(this, 0)
    
    // 页面显示时刷新数据
    if (this.data.dailyCard) {
      this.loadDailyCard()
    }
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.loadDailyCard().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onShareAppMessage() {
    return {
      title: '每日灵感卡片 - 发现生活的诗意',
      path: '/pages/index/index'
    }
  },

  // 初始化应用
  async initializeApp() {
    try {
      // 先尝试静默登录
      await this.silentLogin()
      // 然后加载卡片
      this.loadDailyCard()
    } catch (error) {
      console.error('初始化失败:', error)
      // 即使登录失败也显示默认卡片
      this.loadDailyCard()
    }
  },

  // 静默登录
  async silentLogin() {
    return new Promise((resolve, reject) => {
      // 检查是否已有token
      const token = wx.getStorageSync('token')
      if (token) {
        resolve(token)
        return
      }

      // 获取微信登录code
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发送code到后端获取token
            wx.request({
              url: 'https://api.example.com/api/users/login',
              method: 'POST',
              data: { code: res.code },
              success: (response) => {
                if (response.data && response.data.success) {
                  const token = response.data.data.token
                  wx.setStorageSync('token', token)
                  resolve(token)
                } else {
                  console.warn('登录失败:', response.data)
                  resolve(null) // 不阻塞应用启动
                }
              },
              fail: (error) => {
                console.error('登录请求失败:', error)
                resolve(null) // 不阻塞应用启动
              }
            })
          } else {
            console.error('获取微信code失败:', res.errMsg)
            resolve(null)
          }
        },
        fail: (error) => {
          console.error('微信登录失败:', error)
          resolve(null)
        }
      })
    })
  },

  // 加载今日卡片
  async loadDailyCard() {
    this.setData({ loading: true })
    
    try {
      const token = wx.getStorageSync('token')
      
      // 如果有token，尝试调用API
      if (token) {
        const response = await new Promise((resolve, reject) => {
          wx.request({
            url: 'https://api.example.com/api/cards/daily',
            method: 'GET',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: resolve,
            fail: reject
          })
        })

        if (response.data && response.data.success) {
          const card = response.data.data
          this.setData({ 
            dailyCard: {
              ...card,
              isLiked: card.is_favorited || false
            }
          })
          return
        }
      }
      
      // 如果API调用失败或没有token，使用默认卡片
      this.setData({
        dailyCard: {
          id: 1,
          content: '"生活就像一盒巧克力，你永远不知道下一颗是什么味道。"',
          author: '阿甘正传',
          isLiked: false
        }
      })
    } catch (error) {
      console.error('加载卡片失败:', error)
      // 使用默认卡片
      this.setData({
        dailyCard: {
          id: 1,
          content: '"生活就像一盒巧克力，你永远不知道下一颗是什么味道。"',
          author: '阿甘正传',
          isLiked: false
        }
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 刷新卡片
  async onRefreshCard() {
    if (this.data.refreshing) return
    
    this.setData({ refreshing: true })
    
    try {
      const token = wx.getStorageSync('token')
      
      if (token) {
        // 尝试生成新卡片
        const response = await new Promise((resolve, reject) => {
          wx.request({
            url: 'https://api.example.com/api/cards/generate',
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            data: {
              type: 'inspirational'
            },
            success: resolve,
            fail: reject
          })
        })

        if (response.data && response.data.success) {
          const card = response.data.data
          this.setData({ 
            dailyCard: {
              ...card,
              isLiked: false
            }
          })
          wx.showToast({
            title: '已获取新卡片',
            icon: 'success'
          })
          return
        }
      }
      
      // 如果API调用失败，生成随机默认卡片
      const defaultCards = [
        {
          id: Math.random(),
          content: '"每一个不曾起舞的日子，都是对生命的辜负。"',
          author: '尼采',
          isLiked: false
        },
        {
          id: Math.random(),
          content: '"生活不是等待暴风雨过去，而是要学会在雨中跳舞。"',
          author: '佚名',
          isLiked: false
        },
        {
          id: Math.random(),
          content: '"山重水复疑无路，柳暗花明又一村。"',
          author: '陆游',
          isLiked: false
        }
      ]
      
      const randomCard = defaultCards[Math.floor(Math.random() * defaultCards.length)]
      this.setData({ dailyCard: randomCard })
      
      wx.showToast({
        title: '已获取新卡片',
        icon: 'success'
      })
    } catch (error) {
      console.error('刷新卡片失败:', error)
      wx.showToast({
        title: '获取失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ refreshing: false })
    }
  },

  // 点赞
  async onLike() {
    if (!this.data.dailyCard) return
    
    const { dailyCard } = this.data
    const newLiked = !dailyCard.isLiked
    
    // 本地更新状态
    this.setData({
      'dailyCard.isLiked': newLiked
    })
    
    try {
      const token = wx.getStorageSync('token')
      
      if (token) {
        const response = await new Promise((resolve, reject) => {
          wx.request({
            url: `https://api.example.com/api/cards/${dailyCard.id}/favorite`,
            method: newLiked ? 'POST' : 'DELETE',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: resolve,
            fail: reject
          })
        })

        if (response.data && response.data.success) {
          // 同步到本地存储 - 存储完整的卡片信息
          const favoriteCards = wx.getStorageSync('favorite_cards_data') || []
          if (newLiked) {
            // 添加到收藏列表
            const existingIndex = favoriteCards.findIndex(card => card.id === dailyCard.id)
            if (existingIndex === -1) {
              favoriteCards.push({
                ...dailyCard,
                favoriteTime: new Date().toISOString(),
                type: 'inspirational',
                typeText: '励志'
              })
              wx.setStorageSync('favorite_cards_data', favoriteCards)
            }
          } else {
            // 从收藏列表移除
            const filteredCards = favoriteCards.filter(card => card.id !== dailyCard.id)
            wx.setStorageSync('favorite_cards_data', filteredCards)
          }
          
          wx.showToast({
            title: newLiked ? '收藏成功' : '取消收藏',
            icon: 'success',
            duration: 1500
          })
          return
        }
      }
      
      // 如果没有token或API调用失败，只显示本地反馈
      wx.showToast({
        title: newLiked ? '❤️' : '🤍',
        icon: 'none',
        duration: 1500
      })
    } catch (error) {
      console.error('点赞操作失败:', error)
      // 失败时回滚状态
      this.setData({
        'dailyCard.isLiked': !newLiked
      })
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 点赞（拇指）
  onThumb() {
    wx.showToast({
      title: '👍',
      icon: 'none'
    })
  },

  // 查看历史
  onHistory() {
    wx.navigateTo({
      url: '/pages/history/list'
    })
  },

  // 个人中心
  onProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  }
})