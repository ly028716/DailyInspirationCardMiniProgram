// 历史灵感页面逻辑 - 简化版
const api = require('../../utils/api')
const tabBarUtils = require('../../utils/tabbar.js')

Page({
  data: {
    cards: [],
    loading: false,
    searchKeyword: '',
    activeFilter: 'all'
  },

  onLoad(options) {
    // 处理页面参数
    if (options && options.tab === 'favorite') {
      this.setData({
        activeFilter: 'favorite'
      })
      wx.setNavigationBarTitle({
        title: '我的收藏'
      })
    }
    this.loadCards()
  },

  onShow() {
    // 使用工具类更新TAB栏选中状态
    tabBarUtils.updateTabBar(this, 1)
    
    // 检查是否需要显示收藏页面
    const showFavorites = wx.getStorageSync('show_favorites')
    if (showFavorites) {
      // 清除标记
      wx.removeStorageSync('show_favorites')
      
      // 切换到收藏状态
      this.setData({
        activeFilter: 'favorite'
      })
      
      // 更新页面标题
      wx.setNavigationBarTitle({
        title: '我的收藏'
      })
      
      // 重新加载卡片
      this.loadCards()
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    // 可以添加防抖搜索
    this.searchCards()
  },

  // 筛选切换
  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      activeFilter: filter
    })
    
    // 更新页面标题
    if (filter === 'favorite') {
      wx.setNavigationBarTitle({
        title: '我的收藏'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '历史灵感'
      })
    }
    
    this.loadCards()
  },

  // 筛选按钮
  onFilter() {
    wx.showActionSheet({
      itemList: ['全部', '收藏', '励志', '诗歌', '哲理'],
      success: (res) => {
        const filters = ['all', 'favorite', 'inspirational', 'poetry', 'philosophy']
        this.setData({
          activeFilter: filters[res.tapIndex]
        })
        this.loadCards()
      }
    })
  },

  // 加载卡片
  loadCards() {
    this.setData({ loading: true })
    
    // 模拟数据
    setTimeout(() => {
      const mockCards = [
        {
          id: 1,
          content: '生活不是等待暴风雨过去，而是要学会在雨中跳舞。',
          type: 'inspirational',
          typeText: '励志',
          date: '2025-09-06',
          likes: 128,
          thumbs: 45
        },
        {
          id: 2,
          content: '山重水复疑无路，柳暗花明又一村。',
          type: 'poetry',
          typeText: '诗歌',
          date: '2025-09-05',
          likes: 89,
          thumbs: 32
        },
        {
          id: 3,
          content: '知者不惑，仁者不忧，勇者不惧。',
          type: 'philosophy',
          typeText: '哲理',
          date: '2025-09-04',
          likes: 156,
          thumbs: 67
        }
      ]
      
      // 根据筛选条件过滤
      let filteredCards = mockCards
      if (this.data.activeFilter === 'favorite') {
        // 从本地存储获取收藏的卡片完整数据
        const favoriteCardsData = wx.getStorageSync('favorite_cards_data') || []
        filteredCards = favoriteCardsData.map(card => ({
          ...card,
          date: card.favoriteTime ? new Date(card.favoriteTime).toISOString().split('T')[0] : '2025-09-08',
          likes: card.likes || Math.floor(Math.random() * 100) + 10,
          thumbs: card.thumbs || Math.floor(Math.random() * 50) + 5
        }))
      } else if (this.data.activeFilter !== 'all') {
        filteredCards = mockCards.filter(card => card.type === this.data.activeFilter)
      }
      
      // 根据搜索关键词过滤
      if (this.data.searchKeyword) {
        filteredCards = filteredCards.filter(card => 
          card.content.includes(this.data.searchKeyword)
        )
      }
      
      this.setData({
        cards: filteredCards,
        loading: false
      })
    }, 500)
  },

  // 搜索卡片
  searchCards() {
    // 防抖处理
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      this.loadCards()
    }, 300)
  },

  // 卡片详情
  onCardDetail(e) {
    const cardId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/card/detail?id=${cardId}`
    })
  },

  // 导航到首页
  onHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 导航到个人页面
  onProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  // 去发现页面
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 清除搜索
  onClearSearch() {
    this.setData({
      searchKeyword: ''
    })
    this.loadCards()
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我的灵感卡片收藏',
      path: '/pages/history/list'
    }
  }
})