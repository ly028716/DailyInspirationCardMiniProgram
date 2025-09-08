// 本地存储工具类
class Storage {
  constructor() {
    this.prefix = 'daily_inspiration_'
  }

  // 设置存储
  set(key, value) {
    try {
      const data = typeof value === 'object' ? JSON.stringify(value) : value
      wx.setStorageSync(this.prefix + key, data)
      return true
    } catch (e) {
      console.error('存储失败:', e)
      return false
    }
  }

  // 获取存储
  get(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(this.prefix + key)
      if (value === null || value === undefined) {
        return defaultValue
      }
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    } catch (e) {
      console.error('读取存储失败:', e)
      return defaultValue
    }
  }

  // 删除存储
  remove(key) {
    try {
      wx.removeStorageSync(this.prefix + key)
      return true
    } catch (e) {
      console.error('删除存储失败:', e)
      return false
    }
  }

  // 清空所有存储
  clear() {
    try {
      wx.clearStorageSync()
      return true
    } catch (e) {
      console.error('清空存储失败:', e)
      return false
    }
  }

  // 获取所有存储
  getAll() {
    try {
      const keys = wx.getStorageInfoSync().keys
      const result = {}
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '')
          result[cleanKey] = this.get(cleanKey)
        }
      })
      return result
    } catch (e) {
      console.error('获取所有存储失败:', e)
      return {}
    }
  }

  // 设置用户信息
  setUserInfo(userInfo) {
    return this.set('user_info', userInfo)
  }

  // 获取用户信息
  getUserInfo() {
    return this.get('user_info', {})
  }

  // 设置用户偏好
  setUserPreference(preference) {
    return this.set('user_preference', preference)
  }

  // 获取用户偏好
  getUserPreference() {
    return this.get('user_preference', {
      type: 'all',
      autoUpdate: true,
      pushTime: '08:00'
    })
  }

  // 设置偏好设置
  setPreferences(preferences) {
    return this.set('preferences', preferences)
  }

  // 获取偏好设置
  getPreferences() {
    return this.get('preferences', {
      type: 'all',
      autoUpdate: true,
      pushTime: '08:00'
    })
  }

  // 设置缓存数据
  setCache(key, value, expireTime = 3600000) { // 默认1小时过期
    const cacheData = {
      value,
      expireTime: Date.now() + expireTime
    }
    return this.set('cache_' + key, cacheData)
  }

  // 获取缓存数据
  getCache(key) {
    const cacheData = this.get('cache_' + key)
    if (cacheData && cacheData.expireTime > Date.now()) {
      return cacheData.value
    }
    this.remove('cache_' + key)
    return null
  }

  // 清除过期缓存
  clearExpiredCache() {
    const keys = wx.getStorageInfoSync().keys
    keys.forEach(key => {
      if (key.startsWith(this.prefix + 'cache_')) {
        const cacheData = this.get(key.replace(this.prefix, ''))
        if (cacheData && cacheData.expireTime <= Date.now()) {
          this.remove(key.replace(this.prefix, ''))
        }
      }
    })
  }
}

// 创建存储实例
const storage = new Storage()

module.exports = storage