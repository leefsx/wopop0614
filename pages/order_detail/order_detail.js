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
    carts:[],
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
  addAddr(){
    wx.navigateTo({
      url: '../address/address',
    })
  },
  onLoad: function (options) {
    var oid = options.oid
    var carts = app.globalData.carts
    var openid = wx.getStorageSync('openid');
    var that = this
    if(oid){
      that.getStatus(oid)
      var getStatusId = setInterval(function () {
        return that.getStatus(oid)
      }, 2000)
      that.setData({ getStatusId: getStatusId })
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
    let getStatusId = this.data.getStatusId
    if (getStatusId) {
      clearInterval(getStatusId)
    }
  },
  onShow: function () {
    let start_date=util.formatTime2(new Date);
    //console.log(start_date)
    this.setData({
      start_date: start_date,
      date: start_date
    })
    var self = this;
    /**
     * 获取本地缓存 地址信息
     
    wx.getStorage({
      key: 'address',
      success: function (res) {
        self.setData({
          delivery_addr: true,
          address: res.data
        })
      }
    })*/
  },
  getStatus(oid) {
    var that = this
    var getStatusId = that.data.getStatusId
    app.apiRequest('order', 'getorder', {
      data: { oid: oid },
      success: function (res) {
        if (res.data.result == 'OK') {
          var order = res.data.order
          var product = res.data.product
          var disass = res.data.disass
          if (order.pay_status == 2){
            clearInterval(getStatusId);
          }
          that.setData({
            order: order,
            product: product,
            disass: disass,
            oid: oid,
            dis_title: res.data.dis_title,
            trade_status: res.data.trade_status,
            pickupaddrs: res.data.pickupaddrs,
            cash: res.data.cash
          })
          if (res.data.address) {
            that.setData({
              delivery_addr: true,
              address: res.data.address
            })
          } else {
            wx.getStorage({
              key: 'address',
              success: function (ress) {
                that.setData({
                  delivery_addr: true,
                  address: ress.data
                })
              }
            })
          }
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
  },
  
  confirmOrders(e) {
    const order_id = e.currentTarget.dataset.oid;
    // const order_index = e.currentTarget.dataset.index;
    var order = this.data.order
    let that = this
    wx.showModal({
      title: '温馨提示：',
      content: '是否确认收货',
      success: function (res) {
        if (res.confirm) {
          // 确认操作
          app.apiRequest('order', 'orderToGet',{
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
    var oid = e.currentTarget.dataset.oid;
    if (oid) {
      wx.navigateTo({
        url: '../ratings/ratings?oid=' + oid,
      })
    } else {
      wx.showToast({
        title: '请求失败',
        icon: 'loading',
        duration: 5000
      })
    }
  },
  payOrders(opt) {
    var oid = opt.target.dataset.oid
    let cash = this.data.cash || []
    let order = this.data.order
    
      let cash_key = cash.key
      if(cash_key == '2'){
        wx.navigateTo({
          url: '/pages/showsuccess/showsuccess?id=' + cash.id + '&oid=' + oid,
        })
        return false;
      }
    
      wx.showToast({
        title: '请求中...',
        icon: 'loading',
        duration: 5000
      })
      var openid = wx.getStorageSync('openid')
      if (oid && openid) {
        app.apiRequest('order', 'dopayment', {
          data: {
            oid: oid,
            method: 'POST',
            mark: 'new'
          },
          success: function (res) {
            if (res.data.result == 'OK') {
              if (res.data.wxPrice > 0) {
                var temdata = { 'oid': oid, 'openid': openid, 'mark': 'new' }
                //wx pay
                app.apiRequest('order', 'getprepay_id', {
                  data: {
                    data: JSON.stringify(temdata),
                    method: 'POST'
                  },
                  success: function (res) {
                    if (res.data.result == 'OK') {
                      app.globalData.carts = []
                      res.data.oid = oid
                      comm.pay(res.data)
                    } else {
                      var err = res.data.errmsg || '支付失败'
                      wx.showToast({
                        title: err
                      })
                    }
                  }
                })
              } else {
                app.globalData.carts = []
                wx.showToast({
                  title: '支付成功！',
                  icon: 'success',
                  duration: 2500
                })
                wx.redirectTo({
                  url: '../order_detail/order_detail?oid=' + oid,
                })
              }
            } else {
              var err = res.data.errmsg || '支付失败'
              wx.showToast({
                title: err
              })
              return false;
            }
          }
        })

      } else {
        wx.showToast({
          title: '请求失败',
          icon: 'loading',
          duration: 5000
        })
      }

    
  },
  // 取消订单
  cancelOrders() {
    var oid = this.data.oid
    var order = this.data.order
    let that = this
    wx.showModal({
      title: '温馨提示：',
      content: '是否确认取消该订单',
      success: function (res) {
        if (res.confirm) {
          // 确认操作
          app.apiRequest('order', 'remove',{
            data: { oid: oid, otype: 'cancel' },
            success: function (res) {
              if (res.data.result == 'OK') {
                order.order_status = 5
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
  // 发货提醒
  remind(e) {
    const order_id = e.currentTarget.dataset.oid;
    let that = this
    // 提醒发货操作
    app.apiRequest('order', 'order_notice',{
      data: { oid: order_id },
      success: function (res) {
        if (res.data.result == 'OK') {
          wx.showToast({
            title: '已提醒卖家及时发货'
          })
        } else {
          var err = res.data.errmsg || '请求失败'
          wx.showModal({
            content: err
          })
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
          app.apiRequest('order', 'remove',{
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
  },
  viewLogistics(e) {
    var oid = e.currentTarget.dataset.oid;
    var orderid = e.currentTarget.dataset.orderid;
    if (oid) {
      wx.navigateTo({
        url: '../view-logistics/view-logistics?oid=' + oid + '&orderid=' + orderid,
      })
    } else {
      wx.showToast({
        title: '请求失败',
        icon: 'loading',
        duration: 5000
      })
    }
  }
})




