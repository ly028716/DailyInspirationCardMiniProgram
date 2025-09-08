// TAB栏工具类
class TabBarManager {
  constructor() {
    this.currentIndex = 0
    this.tabList = [
      {
        pagePath: '/pages/index/index',
        text: '今日',
        icon: '🏠'
      },
      {
        pagePath: '/pages/history/list', 
        text: '历史',
        icon: '📜'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的',
        icon: '👤'
      }
    ]
  }

  // 更新TAB栏选中状态
  updateTabBar(pageInstance, index) {
    if (typeof pageInstance.getTabBar === 'function' && pageInstance.getTabBar()) {
      pageInstance.getTabBar().setData({
        selected: index
      })
      this.currentIndex = index
    }
  }

  // 根据页面路径获取TAB索引
  getTabIndexByPath(path) {
    return this.tabList.findIndex(item => 
      item.pagePath.replace(/^\//, '') === path.replace(/^\//, '')
    )
  }

  // 切换TAB
  switchTab(url, success, fail) {
    const index = this.getTabIndexByPath(url)
    
    // 添加触觉反馈
    wx.vibrateShort({
      type: 'light'
    })
    
    wx.switchTab({
      url,
      success: (res) => {
        this.currentIndex = index
        success && success(res)
      },
      fail: fail
    })
  }

  // 获取当前TAB信息
  getCurrentTab() {
    return {
      index: this.currentIndex,
      item: this.tabList[this.currentIndex]
    }
  }

  // 设备适配检测
  getDeviceInfo() {
    const systemInfo = wx.getSystemInfoSync()
    return {
      screenWidth: systemInfo.screenWidth,
      screenHeight: systemInfo.screenHeight,
      pixelRatio: systemInfo.pixelRatio,
      safeArea: systemInfo.safeArea,
      isIPhoneX: this.isIPhoneX(systemInfo),
      tabBarHeight: this.getTabBarHeight(systemInfo)
    }
  }

  // 检测是否为iPhone X系列
  isIPhoneX(systemInfo) {
    const { model, screenHeight, screenWidth } = systemInfo
    return model.includes('iPhone X') || 
           model.includes('iPhone 11') || 
           model.includes('iPhone 12') || 
           model.includes('iPhone 13') || 
           model.includes('iPhone 14') ||
           (screenHeight === 812 && screenWidth === 375) ||
           (screenHeight === 896 && screenWidth === 414) ||
           (screenHeight === 844 && screenWidth === 390) ||
           (screenHeight === 926 && screenWidth === 428)
  }

  // 获取TAB栏高度
  getTabBarHeight(systemInfo) {
    const baseHeight = 50
    const safeAreaBottom = systemInfo.safeArea ? 
      systemInfo.screenHeight - systemInfo.safeArea.bottom : 0
    
    return baseHeight + safeAreaBottom
  }

  // 动态设置TAB栏样式
  setTabBarStyle(tabBarInstance) {
    const deviceInfo = this.getDeviceInfo()
    const style = {
      height: `${deviceInfo.tabBarHeight}px`,
      paddingBottom: deviceInfo.isIPhoneX ? '34px' : '0px'
    }
    
    if (tabBarInstance && tabBarInstance.setData) {
      tabBarInstance.setData({
        tabBarStyle: this.styleObjectToString(style)
      })
    }
    
    return style
  }

  // 样式对象转字符串
  styleObjectToString(styleObj) {
    return Object.keys(styleObj)
      .map(key => `${this.camelToKebab(key)}: ${styleObj[key]}`)
      .join('; ')
  }

  // 驼峰转短横线
  camelToKebab(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
  }

  // 初始化页面TAB状态
  initPageTabBar(pageInstance) {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const route = currentPage.route
    const index = this.getTabIndexByPath(route)
    
    if (index !== -1) {
      this.updateTabBar(pageInstance, index)
    }
  }

  // 添加页面切换动效
  addPageTransition(direction = 'left') {
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
    })
    
    if (direction === 'left') {
      animation.translateX(-100).opacity(0).step()
      animation.translateX(0).opacity(1).step()
    } else {
      animation.translateX(100).opacity(0).step()
      animation.translateX(0).opacity(1).step()
    }
    
    return animation.export()
  }
}

// 创建全局实例
const tabBarManager = new TabBarManager()

// 导出工具函数
module.exports = {
  tabBarManager,
  
  // 快捷方法
  updateTabBar: (pageInstance, index) => {
    tabBarManager.updateTabBar(pageInstance, index)
  },
  
  switchTab: (url, success, fail) => {
    tabBarManager.switchTab(url, success, fail)
  },
  
  initPageTabBar: (pageInstance) => {
    tabBarManager.initPageTabBar(pageInstance)
  },
  
  getDeviceInfo: () => {
    return tabBarManager.getDeviceInfo()
  },
  
  setTabBarStyle: (tabBarInstance) => {
    return tabBarManager.setTabBarStyle(tabBarInstance)
  }
}