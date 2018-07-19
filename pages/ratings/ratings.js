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
    // wjxNum: ['/images/wjx.png', '/images/wjx.png', '/images/wjx.png', '/images/wjx.png','/images/wjx.png'],
    wjxNum2: ['icon-wujiaoxing2', 'icon-wujiaoxing2', 'icon-wujiaoxing2', 'icon-wujiaoxing2', 'icon-wujiaoxing2'],
    score: '',
    content: '',
    submit: true,
    product: []
  },
  onLoad: function (options) {
    var oid = options.oid
    var carts = app.globalData.carts
    var openid = wx.getStorageSync('openid');
    var that = this
    if (oid) {
      app.apiRequest('order', 'getorder',{
        data: { oid: oid },
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
      app.apiRequest('order', 'orderCommentsub',{
        data: {
          oid: oid,
          type: '1'
        },
        success: function (res) {
          if (res.data.result == 'OK') {
            var score = parseInt(res.data.score)
            if(score>0){
              let wjxNum2 = that.data.wjxNum2;
              for (let key in wjxNum2) {
                wjxNum2[key] = 'icon-wujiaoxing2'
              }
              for (let key in wjxNum2) {
                if (key < score) {
                  wjxNum2[key] = 'icon-wujiaoxing'
                }
              }
              that.setData({
                content: res.data.content,
                score: score,
                wjxNum2: wjxNum2,
                submit: false
              })
            }
          } else {
          }
        }
      })
      that.setData({
        oid: oid
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
  },
  // selectStar(e) {
  //   let index = e.currentTarget.dataset.index;
  //   let wjxNum = this.data.wjxNum;
  //   let submit = this.data.submit
  //   if (submit == false) return false
  //   for (let key in wjxNum) {
  //     wjxNum[key] = '/images/wjx.png'
  //   }
  //   for (let key in wjxNum) {
  //     if(key <= index){
  //       wjxNum[key] ='/images/wjx-select.png'
  //     }
  //   }
  //   this.setData({
  //     wjxNum: wjxNum,
  //     score: index
  //   })
  // },
  selectStar2(e) {
    let index = e.currentTarget.dataset.index;
    let wjxNum2 = this.data.wjxNum2;
    let submit = this.data.submit
    if (submit == false) return false
    for (let key in wjxNum2) {
      wjxNum2[key] = 'icon-wujiaoxing2'
    }
    for (let key in wjxNum2) {
      if (key <= index) {
        wjxNum2[key] = 'icon-wujiaoxing'
      }
    }
    this.setData({
      wjxNum2: wjxNum2,
      score: index
    })
  }, 
  binkContentConfirm(e) {
    this.setData({
      content: e.detail.value
    })
  },
  submit(e){
    var score = this.data.score
    var content = this.data.content
    var oid  = this.data.oid
    if (score.length < 1) {
      wx.showToast({
        title: '请选择评分',
      })
    } else if (content.length < 1) {
      wx.showToast({
        title: '请填写评价',
      })
    }else{
      app.apiRequest('order', 'orderCommentsub',{
        data: {
          oid: oid,
          score: score,
          content: content
        },
        success: function (res) {
          if (res.data.result == 'OK') {
            wx.redirectTo({
              url: '../orders/orders?activeIndex=all',
            })
          } else {
            var res = res.data.errmsg || '请求失败'
            wx.showToast({
              title: res
            })

          }
        }
      })
    }
    
  }
})




