// 设置页面逻辑 - 符合UI原型
Page({
  data: {
    // 主题设置
    currentTheme: 'light', // light, dark, auto
    
    // 字体大小设置
    fontSize: 'medium', // small, medium, large
    fontSizeText: '中等',
    
    // 卡片类型设置
    cardTypes: ['励志', '诗歌', '哲理'],
    cardTypeText: '励志、诗歌、哲理',
    
    // 卡片来源设置
    cardSource: 'curated', // curated, ai, mixed
    cardSourceText: '精选',
    
    // 刷新频率设置
    refreshFrequency: 'daily', // hourly, daily, weekly
    refreshFrequencyText: '每天',
    
    // 通知设置
    pushEnabled: true,
    pushTime: '08:00'
  },

  onLoad() {
    this.loadSettings()
  },

  // 加载设置
  loadSettings() {
    try {
      const settings = wx.getStorageSync('app_settings') || {}
      
      this.setData({
        currentTheme: settings.theme || 'light',
        fontSize: settings.fontSize || 'medium',
        cardTypes: settings.cardTypes || ['励志', '诗歌', '哲理'],
        cardSource: settings.cardSource || 'curated',
        refreshFrequency: settings.refreshFrequency || 'daily',
        pushEnabled: settings.pushEnabled !== false,
        pushTime: settings.pushTime || '08:00'
      })
      
      this.updateDisplayTexts()
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  },

  // 更新显示文本
  updateDisplayTexts() {
    const fontSizeMap = {
      'small': '小',
      'medium': '中等',
      'large': '大'
    }
    
    const cardSourceMap = {
      'curated': '精选',
      'ai': 'AI生成',
      'mixed': '混合'
    }
    
    const refreshFrequencyMap = {
      'hourly': '每小时',
      'daily': '每天',
      'weekly': '每周'
    }
    
    this.setData({
      fontSizeText: fontSizeMap[this.data.fontSize],
      cardTypeText: this.data.cardTypes.join('、'),
      cardSourceText: cardSourceMap[this.data.cardSource],
      refreshFrequencyText: refreshFrequencyMap[this.data.refreshFrequency]
    })
  },

  // 保存设置
  saveSettings() {
    try {
      const settings = {
        theme: this.data.currentTheme,
        fontSize: this.data.fontSize,
        cardTypes: this.data.cardTypes,
        cardSource: this.data.cardSource,
        refreshFrequency: this.data.refreshFrequency,
        pushEnabled: this.data.pushEnabled,
        pushTime: this.data.pushTime
      }
      
      wx.setStorageSync('app_settings', settings)
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  },

  // 主题切换
  onThemeChange(e) {
    const theme = e.currentTarget.dataset.theme
    this.setData({ currentTheme: theme })
    this.saveSettings()
    
    wx.showToast({
      title: `已切换到${theme === 'light' ? '明亮' : theme === 'dark' ? '暗黑' : '跟随系统'}主题`,
      icon: 'success',
      duration: 1500
    })
  },

  // 字体大小设置
  onFontSizeChange() {
    const options = [
      { value: 'small', text: '小' },
      { value: 'medium', text: '中等' },
      { value: 'large', text: '大' }
    ]
    
    wx.showActionSheet({
      itemList: options.map(item => item.text),
      success: (res) => {
        const selected = options[res.tapIndex]
        this.setData({ 
          fontSize: selected.value,
          fontSizeText: selected.text
        })
        this.saveSettings()
        
        wx.showToast({
          title: `字体大小已设置为${selected.text}`,
          icon: 'success'
        })
      }
    })
  },

  // 卡片类型设置
  onCardTypeChange() {
    const allTypes = ['励志', '诗歌', '哲理', '名言', '故事', '思考']
    
    wx.showActionSheet({
      itemList: ['全部类型', '自定义选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 选择全部类型
          this.setData({ 
            cardTypes: allTypes.slice(0, 3),
            cardTypeText: '励志、诗歌、哲理'
          })
          this.saveSettings()
        } else {
          // 自定义选择 - 这里可以扩展为多选对话框
          wx.showToast({
            title: '自定义选择功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },

  // 卡片来源设置
  onCardSourceChange() {
    const options = [
      { value: 'curated', text: '精选' },
      { value: 'ai', text: 'AI生成' },
      { value: 'mixed', text: '混合' }
    ]
    
    wx.showActionSheet({
      itemList: options.map(item => item.text),
      success: (res) => {
        const selected = options[res.tapIndex]
        this.setData({ 
          cardSource: selected.value,
          cardSourceText: selected.text
        })
        this.saveSettings()
        
        wx.showToast({
          title: `卡片来源已设置为${selected.text}`,
          icon: 'success'
        })
      }
    })
  },

  // 刷新频率设置
  onRefreshFrequencyChange() {
    const options = [
      { value: 'hourly', text: '每小时' },
      { value: 'daily', text: '每天' },
      { value: 'weekly', text: '每周' }
    ]
    
    wx.showActionSheet({
      itemList: options.map(item => item.text),
      success: (res) => {
        const selected = options[res.tapIndex]
        this.setData({ 
          refreshFrequency: selected.value,
          refreshFrequencyText: selected.text
        })
        this.saveSettings()
        
        wx.showToast({
          title: `刷新频率已设置为${selected.text}`,
          icon: 'success'
        })
      }
    })
  },

  // 推送开关
  onPushChange(e) {
    const enabled = e.detail.value
    this.setData({ pushEnabled: enabled })
    this.saveSettings()
    
    if (enabled) {
      // 请求通知权限
      wx.requestSubscribeMessage({
        tmplIds: ['your_template_id'], // 替换为实际的模板ID
        success: (res) => {
          wx.showToast({
            title: '推送通知已开启',
            icon: 'success'
          })
        },
        fail: (error) => {
          console.error('请求通知权限失败:', error)
          wx.showToast({
            title: '请在设置中开启通知权限',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '推送通知已关闭',
        icon: 'success'
      })
    }
  },

  // 推送时间设置
  onPushTimeChange() {
    wx.showModal({
      title: '设置推送时间',
      content: '请选择每日推送时间',
      showCancel: true,
      success: (res) => {
        if (res.confirm) {
          // 这里可以扩展为时间选择器
          const times = ['06:00', '07:00', '08:00', '09:00', '10:00']
          wx.showActionSheet({
            itemList: times,
            success: (timeRes) => {
              const selectedTime = times[timeRes.tapIndex]
              this.setData({ pushTime: selectedTime })
              this.saveSettings()
              
              wx.showToast({
                title: `推送时间已设置为${selectedTime}`,
                icon: 'success'
              })
            }
          })
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

  // 导航到历史页面
  onHistory() {
    wx.switchTab({
      url: '/pages/history/list'
    })
  }
})