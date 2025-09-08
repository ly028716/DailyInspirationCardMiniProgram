// 自定义TAB栏组件
Component({
  data: {
    currentTab: 0,
    tabList: [
      {
        pagePath: '/pages/index/index',
        text: '今日',
        icon: 'icon-home'
      },
      {
        pagePath: '/pages/history/list',
        text: '历史',
        icon: 'icon-history'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的',
        icon: 'icon-profile'
      }
    ]
  },

  properties: {
    // 当前选中的TAB索引
    selected: {
      type: Number,
      value: 0,
      observer: function(newVal) {
        this.setData({
          currentTab: newVal
        })
      }
    }
  },

  methods: {
    // TAB点击事件
    onTabClick(e) {
      const index = e.currentTarget.dataset.index
      const tabItem = this.data.tabList[index]
      
      // 触发切换动效
      this.triggerRippleEffect(index)
      
      // 延迟跳转，让动效完成
      setTimeout(() => {
        if (tabItem.pagePath.includes('index') || 
            tabItem.pagePath.includes('history') || 
            tabItem.pagePath.includes('profile')) {
          wx.switchTab({
            url: tabItem.pagePath
          })
        } else {
          wx.navigateTo({
            url: tabItem.pagePath
          })
        }
      }, 150)
    },

    // 触发波纹动效
    triggerRippleEffect(index) {
      this.setData({
        currentTab: index
      })
      
      // 触发父组件事件
      this.triggerEvent('tabchange', {
        index: index,
        item: this.data.tabList[index]
      })
    },

    // 更新当前TAB
    updateCurrentTab(index) {
      this.setData({
        currentTab: index
      })
    }
  },

  lifetimes: {
    attached() {
      // 组件初始化时获取当前页面路径
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const route = currentPage.route
      
      // 根据当前路径设置选中状态
      this.data.tabList.forEach((item, index) => {
        if (item.pagePath.includes(route)) {
          this.setData({
            currentTab: index
          })
        }
      })
    }
  }
})