var app = getApp()
var comm = require('../../wxParse/common.js');
Page({
    data: {
        activeIndex: 0,
        order: {},
        prompt: {
            hidden: !0,
        },
        orders: [],
        pageid: 'orders/orders'
    },
    onLoad(options) {
      if (!options.activeIndex) {
        options.activeIndex = 'all'
      }
      this.setData({
        activeIndex: options.activeIndex
      })
    },
    onShow(){
      var that = this;
      var type = that.data.activeIndex
      app.apiRequest('meal', 'order_list', {
        data: { type: type },
        success: function (res) {
          if (res.data.result == 'OK') {
            that.setData({
              "prompt.hidden": !!res.data.data,
              orders: res.data.data || []
            })
          } else if (res.data.errmsg == '2') {
            wx.navigateTo({
              url: '../login/login'
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
    },
    // 取消订单
    cancelOrders(e){
      const oid = e.currentTarget.dataset.oid;
      const index = e.currentTarget.dataset.index;
      const activeIndex = this.data.activeIndex
      let that = this
      wx.showModal({
        title: '温馨提示：',
        content: '是否确认取消该订单',
        success: function (res) {
          if (res.confirm) {
            // 确认操作
            app.apiRequest('meal', 'orderOperation',{
              data: { oid: oid, otype: 'cancel' },
              success: function (res) {
                if (res.data.result == 'OK') {
                  wx.showToast({
                    title: '操作成功'
                  })
                  wx.redirectTo({
                    url: '../meal_order_list/meal_order_list?activeIndex=' + activeIndex
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
    // 申请退款
    refund(e){
      const oid = e.currentTarget.dataset.oid;
      const index = e.currentTarget.dataset.index;
      const activeIndex = this.data.activeIndex
      let that = this
      wx.showModal({
        title: '温馨提示：',
        content: '是否确认退款',
        success: function (res) {
          if (res.confirm) {
            // 确认操作
            app.apiRequest('meal', 'orderOperation',{
              data: { oid: oid, otype: 'refund' },
              success: function (res) {
                if (res.data.result == 'OK') {
                  wx.showToast({
                    title: '操作成功'
                  })
                  wx.redirectTo({
                    url: '../meal_order_list/meal_order_list?activeIndex=' + activeIndex
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

    // 确认订单
    confirmOrders(e){
      let orders = this.data.orders
      let oid = e.currentTarget.dataset.oid
      let order_index = e.currentTarget.dataset.index
      let activeIndex = this.data.activeIndex
      let that = this
      if (oid) {
        wx.showModal({
          title: '温馨提示：',
          content: '是否确认完成',
          success: function (res) {
            if (res.confirm) {
              // 确认操作
              app.apiRequest('meal', 'orderOperation', {
                data: { oid: oid, otype: 'confirm'},
                success: function (res) {
                  if (res.data.result == 'OK') {
                    wx.showToast({
                      title: '确认成功'
                    })
                    orders[order_index]['order_status'] = 3
                    that.setData({
                      orders: orders
                    })
                    wx.redirectTo({
                      url: '../meal_order_list/meal_order_list?activeIndex=' + activeIndex
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
      }else{
        wx.showToast({
          title: '参数错误'
        })
      }
    },
    // 提醒卖家发货
    remind(e){
    },
    //再次购买
    buyAgain(e) {
      var oid = e.currentTarget.dataset.oid;
      if (oid) {
        wx.redirectTo({
          url: '../meal_list/meal_list?oid=' + oid,
        })
      } else {
        wx.showToast({
          title: '请求失败',
          icon: 'loading',
          duration: 5000
        })
      }
    },
    viewLogistics(e){
    },
    rating(e) {
      var oid = oid = e.currentTarget.dataset.oid;
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
    changActive(e){
        var that = this
        const id = e.currentTarget.dataset.id;
        that.setData({
            activeIndex: id
        })
        var type = id
        app.apiRequest('meal', 'order_list',{
          data: { type: type },
          success: function (res) {
            if (res.data.result == 'OK') {
              that.setData({
                "prompt.hidden": !!res.data.data,
                orders: res.data.data || []
              })
            }
          }
        })
    },
    
    deleteOrderList(e) {
      const oid = e.currentTarget.dataset.oid;
      const index = e.currentTarget.dataset.index;
      let that = this
      wx.showModal({
        title: '温馨提示：',
        content: '是否确认删除该订单',
        success: function (res) {
          if (res.confirm) {
            app.apiRequest('meal', 'orderOperation',{
              data: { oid: oid, otype:'remove' },
              success: function (res) {
                if (res.data.result == 'OK') {
                  wx.showToast({
                    title: '操作成功'
                  })
                  var orders = that.data.orders
                  orders.splice(index,1)
                  that.setData({
                    orders: orders
                  })
                }else{
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
    payOrders(opt) {
      let orders = this.data.orders
      let index = opt.target.dataset.index
      if (orders[index]) {
        let order = orders[index]
        let oid = order.id
        let total_price = order.total_price
        if (oid && total_price){
          comm.wxPay(oid,total_price);
        }else{
          wx.showModal({
            title: '订单异常',
            content: '', showCancel: false
          });
        }
      }
    },
    switchTab: function (e) {
      let url = e.currentTarget.dataset.url;
      getApp().turnToPage(url, true)
    }
})