// API请求封装工具类
const baseUrl = 'http://localhost:8000/api'

class Api {
  constructor() {
    this.baseUrl = baseUrl
  }

  // 通用请求方法
  async request(options) {
    const token = wx.getStorageSync('token')
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.success) {
              resolve(res.data.data)
            } else {
              wx.showToast({
                title: res.data.message || '请求失败',
                icon: 'none'
              })
              reject(res.data)
            }
          } else if (res.statusCode === 401) {
            // 未授权，清除token并重新登录
            wx.removeStorageSync('token')
            wx.showToast({
              title: '请重新登录',
              icon: 'none'
            })
            reject(res.data)
          } else {
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            })
            reject(res.data)
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络连接失败',
            icon: 'none'
          })
          reject(err)
        }
      })
    })
  }

  // 用户相关API
  async login(code) {
    return this.request({
      url: '/users/login',
      method: 'POST',
      data: { code }
    })
  }

  async getUserProfile() {
    return this.request({
      url: '/users/profile',
      method: 'GET'
    })
  }

  async updateUserProfile(data) {
    return this.request({
      url: '/users/profile',
      method: 'PUT',
      data
    })
  }

  // 卡片相关API
  async getDailyCard() {
    return this.request({
      url: '/cards/daily',
      method: 'GET'
    })
  }

  async getHistoryCards(page = 1, limit = 20) {
    return this.request({
      url: `/cards/history?page=${page}&limit=${limit}`,
      method: 'GET'
    })
  }

  async generateCard(type = 'inspirational') {
    return this.request({
      url: '/cards/generate',
      method: 'POST',
      data: { type }
    })
  }

  async favoriteCard(cardId) {
    return this.request({
      url: `/cards/${cardId}/favorite`,
      method: 'POST'
    })
  }

  async unfavoriteCard(cardId) {
    return this.request({
      url: `/cards/${cardId}/favorite`,
      method: 'DELETE'
    })
  }

  async getFavorites(page = 1, limit = 20) {
    return this.request({
      url: `/cards/favorites?page=${page}&limit=${limit}`,
      method: 'GET'
    })
  }

  // 设置相关API
  async updatePreferences(preferences) {
    return this.request({
      url: '/users/preferences',
      method: 'PUT',
      data: preferences
    })
  }

  async getPreferences() {
    return this.request({
      url: '/users/preferences',
      method: 'GET'
    })
  }

  // 卡片相关API补充
  async getCardDetail(cardId) {
    return this.request({
      url: `/cards/${cardId}`,
      method: 'GET'
    })
  }

  async getHistoryCards(params = {}) {
    const { page = 1, pageSize = 10, keyword = '' } = params
    const query = new URLSearchParams({
      page,
      limit: pageSize,
      keyword
    }).toString()
    
    return this.request({
      url: `/cards/history?${query}`,
      method: 'GET'
    })
  }

  async getFavoriteCards(params = {}) {
    const { page = 1, pageSize = 10, keyword = '' } = params
    const query = new URLSearchParams({
      page,
      limit: pageSize,
      keyword
    }).toString()
    
    return this.request({
      url: `/cards/favorites?${query}`,
      method: 'GET'
    })
  }

  async likeCard(cardId) {
    return this.request({
      url: `/cards/${cardId}/like`,
      method: 'POST'
    })
  }

  async unlikeCard(cardId) {
    return this.request({
      url: `/cards/${cardId}/like`,
      method: 'DELETE'
    })
  }

  async generateCardImage(cardId) {
    return this.request({
      url: `/cards/${cardId}/image`,
      method: 'POST'
    })
  }
}

// 创建API实例
const api = new Api()

module.exports = api