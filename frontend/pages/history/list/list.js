// pages/history/list/list.js
const api = require('../../../utils/api');

Page({
  data: {
    cards: [],
    page: 1,
    pageSize: 10,
    isLoading: false,
    isRefreshing: false,
    isEnd: false,
    keyword: '',
    currentFilter: 'all',
    showFilterPanel: false
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.cards.length > 0) {
      this.onRefresh();
    }
  },

  // 加载历史记录
  async loadHistory(isLoadMore = false) {
    if (this.data.isLoading || this.data.isEnd) return;

    this.setData({ isLoading: true });

    try {
      const params = {
        page: this.data.page,
        page_size: this.data.pageSize,
        type: this.data.currentFilter !== 'all' ? this.data.currentFilter : undefined,
        keyword: this.data.keyword || undefined
      };

      const res = await api.getHistoryCards(params);
      const newCards = res.data.data || [];

      if (newCards.length < this.data.pageSize) {
        this.setData({ isEnd: true });
      }

      const cards = isLoadMore 
        ? [...this.data.cards, ...newCards] 
        : newCards;

      this.setData({
        cards,
        page: this.data.page + (newCards.length > 0 ? 1 : 0)
      });

    } catch (error) {
      console.error('加载历史记录失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({
        isLoading: false,
        isRefreshing: false
      });
    }
  },

  // 下拉刷新
  onRefresh() {
    this.setData({
      page: 1,
      isEnd: false,
      isRefreshing: true
    });
    this.loadHistory();
  },

  // 上拉加载更多
  loadMore() {
    this.loadHistory(true);
  },

  // 搜索
  onSearch(e) {
    const keyword = e.detail.value.trim();
    this.setData({
      keyword,
      page: 1,
      isEnd: false,
      cards: []
    });
    this.loadHistory();
  },

  // 显示筛选面板
  showFilter() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    });
  },

  // 设置筛选条件
  setFilter(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentFilter: type,
      page: 1,
      isEnd: false,
      cards: [],
      showFilterPanel: false
    });
    this.loadHistory();
  },

  // 跳转到卡片详情
  goToDetail(e) {
    const cardId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/card/detail?id=${cardId}`
    });
  },

  // 分享卡片
  onShareAppMessage(e) {
    const card = e.target.dataset.card;
    return {
      title: card.content.substring(0, 30) + '...',
      path: `/pages/card/detail?id=${card.id}`,
      imageUrl: card.image_url
    };
  },

  // 长按操作
  onLongPress(e) {
    const card = e.currentTarget.dataset.card;
    wx.showActionSheet({
      itemList: ['收藏', '分享', '删除'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.toggleFavorite(card.id);
            break;
          case 1:
            this.shareCard(card);
            break;
          case 2:
            this.deleteCard(card.id);
            break;
        }
      }
    });
  },

  // 切换收藏状态
  async toggleFavorite(cardId) {
    try {
      await api.toggleFavorite(cardId);
      const cards = this.data.cards.map(card => {
        if (card.id === cardId) {
          const newFavorited = !card.is_favorited;
          
          // 同步到本地存储 - 存储完整的卡片信息
          const favoriteCards = wx.getStorageSync('favorite_cards_data') || []
          if (newFavorited) {
            // 添加到收藏列表
            const existingIndex = favoriteCards.findIndex(card => card.id === cardId)
            if (existingIndex === -1) {
              const cardToSave = this.data.cards.find(c => c.id === cardId)
              if (cardToSave) {
                favoriteCards.push({
                  ...cardToSave,
                  favoriteTime: new Date().toISOString(),
                  isFavorited: true
                })
                wx.setStorageSync('favorite_cards_data', favoriteCards)
              }
            }
          } else {
            // 从收藏列表移除
            const filteredCards = favoriteCards.filter(card => card.id !== cardId)
            wx.setStorageSync('favorite_cards_data', filteredCards)
          }
          
          return {
            ...card,
            is_favorited: newFavorited,
            favorites: card.is_favorited ? card.favorites - 1 : card.favorites + 1
          };
        }
        return card;
      });
      
      this.setData({ cards });
      wx.showToast({
        title: '操作成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 删除卡片
  deleteCard(cardId) {
    wx.showModal({
      title: '提示',
      content: '确定要删除这张卡片吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteCard(cardId);
            const cards = this.data.cards.filter(card => card.id !== cardId);
            this.setData({ cards });
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (error) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // 24小时内
      return '今天';
    } else if (diff < 172800000) { // 48小时内
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    }
  }
});