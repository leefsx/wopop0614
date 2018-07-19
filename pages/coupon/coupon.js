// pages/component/coupon/coupon.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeIndex: 'all',
    prompt: {
      hidden: !0,
    },
    coupons: [
      {
        money:100,
        condition: 2000,
        title: '圣诞礼券',
        start_time: '2017.12.24',
        end_time: '2017.12.26',
        status: 'all',
        num: 2
      },
      {
        money: 100,
        condition: 2000,
        title: '圣诞礼券',
        start_time: '2017.12.24',
        end_time: '2017.12.26',
        status: 'overdue',
        num: 2
      },
      {
        money: 100,
        condition: 2000,
        title: '圣诞礼券',
        start_time: '2017.12.24',
        end_time: '2017.12.26',
        status: 'nouse',
        num: 5
      },
      {
        money: 100,
        condition: 2000,
        title: '圣诞礼券',
        start_time: '2017.12.24',
        end_time: '2017.12.26',
        status: 'hasuse',
        num: 2
      },
      {
        money: 100,
        condition: 2000,
        title: '圣诞礼券',
        start_time: '2017.12.24',
        end_time: '2017.12.26',
        status: 'all',
        num: 3
      }
    ]
  },
  changActive(e, activeIndex = '') {
    var that = this
    var types = ''
    var methodname = 'events_coupons'
    var id = ''
    that.setData({
      coupons: {}
    })
    if (activeIndex){
      var id = activeIndex
    }else{
      var id = e.currentTarget.dataset.id;
    }
    if (id == 'all'){
      types = 'canuse'
    } else if (id == 'overdue'){
      types = 'expired'
    } else if (id == 'nouse' || id == 'hasuse'){
      methodname = 'coupons'
      types = id
    }
    app.apiRequest('user', methodname, {
      data: {type: types},
      success: function(res){
        if(res.data.result = 'OK'){
          that.setData({
            coupons: res.data.data
          })
        }
      }
    })
    that.setData({
      activeIndex: id
    })
  },
  get_coupons(e) {
    var that = this
    var cid = e.currentTarget.dataset.id
    app.apiRequest('user','gotcoupon', {
      data: {cid: cid},
      success: function (res){
        if(res.data.result == 'OK'){
          wx.showToast({
            title: '领取成功',
            icon: 'success',
            duration: 2000
          })
          that.changActive('','nouse')
        } else if (res.data.errmsg == '2'){
          wx.showToast({
            title: '请先登录',
            icon: 'loading',
            duration: 2000
          })
          wx.navigateTo({
            url: '../login/login'
          })
        }else{
          let err = res.data.errmsg || '领取失败'
          wx.showToast({
            title: '领取失败',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    let cuser = app.globalData.cuser
    if (cuser.length == 0) {
      wx.navigateTo({
        url: '../login/login'
      })
    }
    app.apiRequest('user', 'events_coupons', {
      data: {},
      success: function (res) {
        if (res.data.result == 'OK') {
          that.setData({
            coupons: res.data.data
          })
        }
      }

    })
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})