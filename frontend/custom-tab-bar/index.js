// 自定义TAB栏入口文件
const tabBarUtils = require('../utils/tabbar.js')

Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#FF8C42",
    backgroundColor: "#ffffff",
    tabBarStyle: "",
    deviceInfo: {},
    list: [
      {
        pagePath: "/pages/index/index",
        iconPath: "/assets/icons/tab-home.svg",
        selectedIconPath: "/assets/icons/tab-home-active.svg", 
        text: "今日",
        icon: "🏠"
      },
      {
        pagePath: "/pages/history/list",
        iconPath: "/assets/icons/tab-history.svg",
        selectedIconPath: "/assets/icons/tab-history-active.svg",
        text: "历史", 
        icon: "📜"
      },
      {
        pagePath: "/pages/profile/profile",
        iconPath: "/assets/icons/tab-profile.svg",
        selectedIconPath: "/assets/icons/tab-profile-active.svg",
        text: "我的",
        icon: "👤"
      }
    ]
  },

  attached() {
    // 获取设备信息并设置样式
    const deviceInfo = tabBarUtils.getDeviceInfo()
    const tabBarStyle = tabBarUtils.setTabBarStyle(this)
    
    this.setData({
      deviceInfo: deviceInfo,
      tabBarStyle: tabBarUtils.tabBarManager.styleObjectToString(tabBarStyle)
    })
    
    // 获取当前页面栈
    const pages = getCurrentPages()
    if (pages && pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      if (currentPage) {
        const url = currentPage.route
        
        // 设置当前选中的TAB
        const selected = this.data.list.findIndex(item => 
          item.pagePath.replace(/^\//, '') === url
        )
        
        if (selected !== -1) {
          this.setData({
            selected: selected
          })
        }
      }
    }
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      const index = data.index
      
      // 防止重复点击
      if (this.data.selected === index) {
        return
      }
      
      // 添加点击动效
      this.setData({
        selected: index
      })
      
      // 使用工具类的切换方法
      tabBarUtils.switchTab(url, () => {
        this.setData({
          selected: index
        })
      }, (error) => {
        console.error('TAB切换失败:', error)
        // 回滚状态
        this.setData({
          selected: this.data.selected
        })
      })
    },

    // 更新选中状态（供页面调用）
    updateSelected(index) {
      this.setData({
        selected: index
      })
    },

    // 响应设备旋转
    onDeviceOrientationChange() {
      const deviceInfo = tabBarUtils.getDeviceInfo()
      const tabBarStyle = tabBarUtils.setTabBarStyle(this)
      
      this.setData({
        deviceInfo: deviceInfo,
        tabBarStyle: tabBarUtils.tabBarManager.styleObjectToString(tabBarStyle)
      })
    }
  }
})