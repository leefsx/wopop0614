import util from "../../wxParse/util.js"  
var comm = require('../../wxParse/common.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    total_price:0,
    nowtime: '',
    oid: '',
    cuser: [],
    address: [],
    lastPrice:0,
    openid: '',
    product: [],
    order: [],
    disass: [],
    getStatusId: ''
  },
  onLoad: function (options) {
    var oid = options.oid
    var openid = wx.getStorageSync('openid');
    var that = this
    if(oid){
      app.apiRequest('appoit', 'order_detail', {
        data: { oid: oid },
        success: function (res) {
          if (res.data.result == 'OK') {
            that.setData({
              order: res.data.data
            })
          } else if (res.data.errmsg == '2') {
            wx.navigateTo({
              url: '../login/login'
            })
          }
        }
      })
      //that.setData({ getStatusId: getStatusId })
    }else{
      wx.showToast({
        title: '参数错误！',
        duration: 2500
      })
      wx.navigateBack({
        delta: 1
      })
    }
    
  },
  onUnload: function () {
  },
  onShow: function () {
    let that = this
    
  },
  
  confirmOrders(e) {
    let order = this.data.order
    let that = this
    wx.showModal({
      title: '温馨提示：',
      content: '是否确认服务',
      success: function (res) {
        if (res.confirm) {
          // 确认操作
          app.apiRequest('appoit', 'orderToGet',{
            data: { oid: order_id },
            success: function (res) {
              if (res.data.result == 'OK') {
                wx.showToast({
                  title: '确认成功'
                })
                order['delivery_status_no'] = 4
                that.setData({
                  order: order
                })
              } else {
                var err = res.data.errmsg || '请求失败'
                wx.showToast({
                  title: err
                })
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          // 不做任何操作
        }
      }
    })
  },
  rating(e) {
  },
  payOrders(opt) {
    let order = this.data.order
    let oid = order.id
    let total_price = order.total_price
    if (oid && total_price){
      comm.wxPay(oid, total_price);
    }else{
      wx.showModal({
        title: '订单异常',
        content: '', showCancel: false
      });
    }

    
  },
  // 取消订单
  cancelOrders() {
    let that = this
    let order = that.data.order
    let oid = order.id
    wx.showModal({
      title: '温馨提示：',
      content: '是否确认取消该订单',
      success: function (res) {
        if (res.confirm) {
          // 确认操作
          app.apiRequest('appoit', 'orderOperation',{
            data: { oid: oid, otype: 'cancel' },
            success: function (res) {
              if (res.data.result == 'OK') {
                order.order_status = 4
                that.setData({
                  order: order
                })
              } else {
                wx.showToast({
                  title: '取消失败'
                })
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          // 不做任何操作
        }
      }
    })
  },
  deleteOrderList() {
    const oid = this.data.oid
    let that = this
    wx.showModal({
      title: '温馨提示：',
      content: '是否确认删除该订单',
      success: function (res) {
        if (res.confirm) {
          app.apiRequest('appoit', 'orderOperation',{
            data: { oid: oid, otype: 'remove' },
            success: function (res) {
              if (res.data.result == 'OK') {
                wx.redirectTo({
                  url: '../orders/orders?activeIndex=all'
                })
              } else {
                wx.showToast({
                  title: '删除失败'
                })
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          // 不做任何操作
        }
      }
    })
  }
})




