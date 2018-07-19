// page/component/new-pages/user/user.js
var comm = require('../../wxParse/common.js');
let config = require("../../static/config.js");
var app = getApp();
Page({
  data:{
    thumb:'',
    nickname:'',
    orders:[],
    hasAddress:false,
    address:{},
    order_pro_rel:[],
    userInfo: [],
    cuserInfo: [],
    cartleng: 0,
    pageid: 'ucenter/ucenter',
    canIUseNickName: wx.canIUse('open-data.type.userNickName'),
    canIUseAvatarUrl: wx.canIUse('open-data.type.userAvatarUrl'),
    isdistrib: 0
  },
  goToCart(){
    wx.navigateTo({
      url: "../cart/cart",
    })
  },
  onLoad(){
  },
  onShow() {
    var self = this;
    var userInfo = app.globalData.userInfo
    if (userInfo) {
      app.apiRequest('user', 'order_list',{
        data: [],
        success: function (res) {
          if (res.data.result == 'OK') {
            if(res.data.userInfo){
              let curuserinfo = res.data.userInfo;
              userInfo.account_money = curuserinfo.account_money;
              userInfo.account_points = curuserinfo.account_points;
            }
            self.setData({
              cartleng: app.globalData.carts.length,
              order_num_state: res.data.order_num_state,
              userInfo: userInfo,
              isdistrib: res.data.isdistrib
            })
          }
        }
      })
      let curpage = this.data.pageid;
      let tabs = getApp().globalData.config.tabBar || {};
      if (tabs.list) {
        this.setData({ tabs });
        let _has_ = tabs.list.findIndex((c) => {
          return c.pagePath == curpage
        });
        this.setData({
          showBar: _has_ > -1 ? true : false
        })
      }
    } else {
      wx.navigateTo({
        url: '../login/login'
      })
    }
   },
  /**
   * 发起支付请求
   */
  payOrders(opt) {
    wx.showToast({
      title: '请求中...',
      icon: 'loading',
      duration: 5000
    })
    var oid = opt.target.dataset.oid
    if(oid){
      wx.navigateTo({
        url: '../order_confirm/order_confirm?fr=u&oid='+oid,
      })
    }else{
      wx.showToast({
        title: '请求失败',
        icon: 'loading',
        duration: 5000
      })
    }

  },
  onPullDownRefresh: function () {
    this.onShow()
    wx.stopPullDownRefresh()
  },
  toCart(e){
    wx.redirectTo({
      url: '../shopping_cart/shopping_cart',
    })
  },
  switchTab: function (e) {
    let url = e.currentTarget.dataset.url;
    getApp().turnToPage(url, true)
  }
})