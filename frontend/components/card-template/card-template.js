// components/card-template/card-template.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardData: {
      type: Object,
      value: {}
    },
    templateType: {
      type: String,
      value: 'minimal' // minimal, artistic, vibrant
    },
    isLoading: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    animationClass: '',
    backgroundStyle: ''
  },

  /**
   * 组件生命周期函数
   */
  lifetimes: {
    attached() {
      this.updateBackgroundStyle();
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    'templateType': function(newVal) {
      this.updateBackgroundStyle();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateBackgroundStyle() {
      const styles = {
        minimal: {
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          color: '#2c3e50',
          fontFamily: 'PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif'
        },
        artistic: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          fontFamily: 'PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif'
        },
        vibrant: {
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: '#ffffff',
          fontFamily: 'PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif'
        }
      };
      
      this.setData({
        backgroundStyle: styles[this.data.templateType] || styles.minimal
      });
    },

    onCardTap() {
      this.triggerEvent('cardtap', { cardData: this.data.cardData });
    },

    onFavoriteTap(e) {
      e.stopPropagation();
      this.triggerEvent('favoritetap', { 
        cardId: this.data.cardData.id,
        isFavorited: !this.data.cardData.isFavorited
      });
    },

    onShareTap(e) {
      e.stopPropagation();
      this.triggerEvent('sharetap', { cardData: this.data.cardData });
    },

    // 加载动画
    showLoadingAnimation() {
      this.setData({
        animationClass: 'loading-animation'
      });
    },

    hideLoadingAnimation() {
      this.setData({
        animationClass: ''
      });
    },

    // 进入动画
    showEnterAnimation() {
      this.setData({
        animationClass: 'enter-animation'
      });
    }
  }
});