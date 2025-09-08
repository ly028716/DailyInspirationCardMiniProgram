// components/loading-animation/loading-animation.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    loadingText: {
      type: String,
      value: '加载中...'
    },
    type: {
      type: String,
      value: 'dots' // dots, spinner, pulse, cards
    },
    size: {
      type: String,
      value: 'medium' // small, medium, large
    },
    color: {
      type: String,
      value: '#667eea'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    animationData: {},
    isVisible: true
  },

  /**
   * 组件生命周期函数
   */
  lifetimes: {
    attached() {
      this.startAnimation();
    },
    detached() {
      this.stopAnimation();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    startAnimation() {
      const animation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease-in-out',
        delay: 0
      });

      // 根据类型设置不同的动画
      switch(this.data.type) {
        case 'spinner':
          this.startSpinnerAnimation(animation);
          break;
        case 'pulse':
          this.startPulseAnimation(animation);
          break;
        case 'cards':
          this.startCardsAnimation(animation);
          break;
        default:
          this.startDotsAnimation(animation);
      }
    },

    startDotsAnimation(animation) {
      const animate = () => {
        animation.opacity(0.3).step({ duration: 500 });
        animation.opacity(1).step({ duration: 500 });
        this.setData({
          animationData: animation.export()
        });
      };
      
      animate();
      this.animationInterval = setInterval(animate, 1000);
    },

    startSpinnerAnimation(animation) {
      let rotation = 0;
      const animate = () => {
        rotation += 360;
        animation.rotate(rotation).step();
        this.setData({
          animationData: animation.export()
        });
      };
      
      animate();
      this.animationInterval = setInterval(animate, 1000);
    },

    startPulseAnimation(animation) {
      const animate = () => {
        animation.scale(0.8).step({ duration: 600 });
        animation.scale(1.2).step({ duration: 600 });
        animation.scale(1).step({ duration: 600 });
        this.setData({
          animationData: animation.export()
        });
      };
      
      animate();
      this.animationInterval = setInterval(animate, 1800);
    },

    startCardsAnimation(animation) {
      // 卡片翻转动画
      const animate = () => {
        animation.rotateY(180).step({ duration: 800 });
        animation.rotateY(0).step({ duration: 800 });
        this.setData({
          animationData: animation.export()
        });
      };
      
      animate();
      this.animationInterval = setInterval(animate, 1600);
    },

    stopAnimation() {
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
        this.animationInterval = null;
      }
    },

    show() {
      this.setData({ isVisible: true });
      this.startAnimation();
    },

    hide() {
      this.setData({ isVisible: false });
      this.stopAnimation();
    }
  }
});