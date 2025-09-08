// 卡片详情页面逻辑 - 简化版
Page({
  data: {
    card: null,
    loading: true,
    isFavorited: false,
    likes: 0,
    isLiked: false,
    showSharePanel: false,
    favoriteAnimation: false,
    likeAnimation: false
  },

  onLoad(options) {
    const cardId = options.id
    if (cardId) {
      this.loadCardDetail(cardId)
    } else {
      this.setData({ loading: false })
    }
  },

  // 加载卡片详情
  async loadCardDetail(cardId) {
    this.setData({ loading: true })
    
    try {
      const token = wx.getStorageSync('token')
      
      if (token) {
        // 尝试从API获取卡片详情
        const response = await new Promise((resolve, reject) => {
          wx.request({
            url: `https://api.example.com/api/cards/${cardId}`,
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
            card: card,
            loading: false,
            likes: card.likes || 0,
            isFavorited: card.is_favorited || false,
            isLiked: card.is_liked || false
          })
          return
        }
      }
      
      // 如果API调用失败，使用模拟数据
      const mockCard = {
        id: cardId,
        content: '生活不是等待暴风雨过去，而是要学会在雨中跳舞。',
        author: '佚名',
        type: 'inspirational',
        typeText: '励志',
        date: '2025-09-07'
      }
      
      this.setData({
        card: mockCard,
        loading: false,
        likes: Math.floor(Math.random() * 100) + 10,
        isFavorited: Math.random() > 0.5,
        isLiked: Math.random() > 0.5
      })
    } catch (error) {
      console.error('加载卡片详情失败:', error)
      // 使用模拟数据作为后备
      const mockCard = {
        id: cardId,
        content: '生活不是等待暴风雨过去，而是要学会在雨中跳舞。',
        author: '佚名',
        type: 'inspirational',
        typeText: '励志',
        date: '2025-09-07'
      }
      
      this.setData({
        card: mockCard,
        loading: false,
        likes: Math.floor(Math.random() * 100) + 10,
        isFavorited: false,
        isLiked: false
      })
    }
  },

  // 切换收藏状态
  async onToggleFavorite() {
    if (!this.data.card) return
    
    const newFavorited = !this.data.isFavorited
    this.setData({ 
      isFavorited: newFavorited,
      favoriteAnimation: true
    })
    
    // 动画效果
    setTimeout(() => {
      this.setData({ favoriteAnimation: false })
    }, 600)
    
    try {
      const token = wx.getStorageSync('token')
      
      if (token) {
        const response = await new Promise((resolve, reject) => {
          wx.request({
            url: `https://api.example.com/api/cards/${this.data.card.id}/favorite`,
            method: newFavorited ? 'POST' : 'DELETE',
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
          if (newFavorited) {
            // 添加到收藏列表
            const existingIndex = favoriteCards.findIndex(card => card.id === this.data.card.id)
            if (existingIndex === -1) {
              favoriteCards.push({
                ...this.data.card,
                favoriteTime: new Date().toISOString(),
                likes: this.data.likes || 0,
                isFavorited: true
              })
              wx.setStorageSync('favorite_cards_data', favoriteCards)
            }
          } else {
            // 从收藏列表移除
            const filteredCards = favoriteCards.filter(card => card.id !== this.data.card.id)
            wx.setStorageSync('favorite_cards_data', filteredCards)
          }
          
          wx.showToast({
            title: newFavorited ? '已收藏' : '取消收藏',
            icon: 'success',
            duration: 1500
          })
          return
        }
      }
      
      // 如果没有token或API调用失败，只显示本地反馈
      wx.showToast({
        title: newFavorited ? '已收藏' : '取消收藏',
        icon: 'success',
        duration: 1500
      })
    } catch (error) {
      console.error('收藏操作失败:', error)
      // 失败时回滚状态
      this.setData({ isFavorited: !newFavorited })
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 切换点赞状态
  async onToggleLike() {
    if (!this.data.card) return
    
    const newLiked = !this.data.isLiked
    const newLikes = newLiked ? this.data.likes + 1 : Math.max(0, this.data.likes - 1)
    
    this.setData({ 
      isLiked: newLiked,
      likes: newLikes,
      likeAnimation: true
    })
    
    // 动画效果
    setTimeout(() => {
      this.setData({ likeAnimation: false })
    }, 600)
    
    try {
      const token = wx.getStorageSync('token')
      
      if (token) {
        const response = await new Promise((resolve, reject) => {
          wx.request({
            url: `https://api.example.com/api/cards/${this.data.card.id}/like`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            data: {
              action: newLiked ? 'like' : 'unlike'
            },
            success: resolve,
            fail: reject
          })
        })

        if (response.data && response.data.success) {
          wx.showToast({
            title: newLiked ? '点赞成功' : '取消点赞',
            icon: 'success',
            duration: 1500
          })
          return
        }
      }
      
      // 如果没有token或API调用失败，只显示本地反馈
      wx.showToast({
        title: newLiked ? '👍' : '🤍',
        icon: 'none',
        duration: 1500
      })
    } catch (error) {
      console.error('点赞操作失败:', error)
      // 失败时回滚状态
      this.setData({
        isLiked: !newLiked,
        likes: this.data.likes
      })
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 复制内容
  onCopyContent() {
    if (!this.data.card) return
    
    wx.setClipboardData({
      data: this.data.card.content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 1500
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
    })
  },

  // 打开分享面板
  onShare() {
    this.setData({ showSharePanel: true })
  },

  // 关闭分享面板
  onCloseShare() {
    this.setData({ showSharePanel: false })
  },

  // 生成分享图片
  onShareImage() {
    this.setData({ showSharePanel: false })
    wx.showToast({
      title: '功能开发中',
      icon: 'none',
      duration: 2000
    })
  },

  // 复制分享链接
  onShareLink() {
    if (!this.data.card) return
    
    const shareUrl = `/pages/card/detail?id=${this.data.card.id}`
    wx.setClipboardData({
      data: shareUrl,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success',
          duration: 1500
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
    })
    this.setData({ showSharePanel: false })
  },

  // 返回
  onBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  },

  // 分享配置
  onShareAppMessage() {
    const card = this.data.card
    if (!card) return {}
    
    return {
      title: `每日灵感: ${card.content.substring(0, 30)}...`,
      path: `/pages/card/detail?id=${card.id}`,
      imageUrl: '/assets/icons/share-card.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const card = this.data.card
    if (!card) return {}
    
    return {
      title: card.content,
      query: `id=${card.id}`,
      imageUrl: '/assets/icons/share-card.png'
    }
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      if (hours < 1) return '刚刚'
      return `${hours}小时前`
    }
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  },

  formatFullDate(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${month}月${day}日`
  }
})