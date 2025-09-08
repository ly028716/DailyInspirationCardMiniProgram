App({
  globalData: {
    userInfo: null,
    openid: null,
    baseUrl: 'http://localhost:8000/api',
    hasLogin: false
  },

  onLaunch() {
    console.log('小程序启动')
    this.checkLogin()
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.hasLogin = true
      this.getUserInfoSilent().catch(error => {
        console.log('静默获取用户信息失败:', error)
        // 静默失败不影响使用，用户可以在需要时手动授权
      })
    }
  },

  // 微信登录
  async wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发送code到后端换取openid和token
            wx.request({
      url: `${this.globalData.baseUrl}/users/login`,
      method: 'POST',
      data: { code: res.code },
      success: (response) => {
                if (response.data.success) {
                  const { openid, token, userInfo } = response.data.data
                  this.globalData.openid = openid
                  this.globalData.userInfo = userInfo
                  this.globalData.hasLogin = true
                  wx.setStorageSync('token', token)
                  resolve(response.data.data)
                } else {
                  reject(response.data.message)
                }
              },
              fail: reject
            })
          } else {
            reject('登录失败！' + res.errMsg)
          }
        },
        fail: reject
      })
    })
  },

  // 获取用户信息 - 必须由用户点击触发
  async getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.globalData.userInfo = res.userInfo
          // 更新用户信息到服务器
          wx.request({
            url: `${this.globalData.baseUrl}/users/profile`,
            method: 'PUT',
            header: {
              'Authorization': `Bearer ${wx.getStorageSync('token')}`
            },
            data: {
              nickname: res.userInfo.nickName,
              avatar: res.userInfo.avatarUrl
            },
            success: resolve,
            fail: reject
          })
        },
        fail: (error) => {
          if (error.errMsg.includes('getUserProfile:fail can only be invoked by user TAP gesture')) {
            console.error('错误：getUserProfile只能在用户点击事件中调用')
          }
          reject(error)
        }
      })
    })
  },

  // 安全获取用户信息（用于自动登录后的静默检查）
  async getUserInfoSilent() {
    // 不调用getUserProfile，只从缓存或服务器获取
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}/users/profile`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        },
        success: (res) => {
          if (res.data.success) {
            this.globalData.userInfo = res.data.data
            resolve(res.data.data)
          } else {
            reject(res.data.message)
          }
        },
        fail: reject
      })
    })
  },

  // 通用请求封装
  request(options) {
    const token = wx.getStorageSync('token')
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        url: `${this.globalData.baseUrl}${options.url}`,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: reject
      })
    })
  }
})