// order_confirm.js
// <import src ="utils/common/nav.wxml" />
import util from "../../wxParse/util.js"  
var comm = require('../../wxParse/common.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: 10,
    status:'',
    logisticname: '',
    logisticno: '',
    product: []
  },
  onLoad: function (options) {
    var oid = options.oid
    var orderid = options.orderid
    var carts = app.globalData.carts
    var openid = wx.getStorageSync('openid');
    var that = this
    if (orderid) {
      app.apiRequest('order', 'getorder',{
        data: { oid: orderid },
        success: function (res) {
          if (res.data.result == 'OK') {
            var product = res.data.product
            that.setData({
              product: product,
            })
          } else {
            wx.showToast({
              title: '参数错误！',
              duration: 2500
            })
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '参数错误！',
        duration: 2500
      })
      wx.navigateBack({
        delta: 1
      })
    }
    if(oid){
      app.apiRequest('order', 'logisticsState',{
        data: {oid: oid},
        success: function(res){
          if (res.data.result == 'OK') {
            that.setData({
              info: res.data.content,
              status: res.data.status,
              logisticname: res.data.logisticname,
              logisticno: res.data.logisticno
            })
          }else{
            var err = res.data.errmsg || '参数错误！'
            wx.showToast({
              title: err,
              duration: 2500
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: '参数错误！',
        duration: 2500
      })
      wx.navigateBack({
        delta: 1
      })
    }
    
  }
})




