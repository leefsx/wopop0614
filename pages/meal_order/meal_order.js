// pages/meal_order/meal_order.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: [
      { t: "支付方式：", r: "微信支付" },
      { t: "下单时间：", r: "" },
    ],
    shop_id: 0,
    getime_type: [],
    getime_index: 0,
    message: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '提交订单'
    })
    let cartsprice = options.cartsprice
    let shop_id = options.shop_id
    let detail = this.data.detail
    let param = { shop_id }
    let that = this
    app.apiRequest('meal', 'onOrder', {
      data: param,
      success: function (res) {
        if (res.data.result == 'OK') {
          let getime_type = that.data.getime_type
          if (res.data.getime_type=='1'){
            getime_type = ['稍后取餐']
          } else if (res.data.getime_type == '0'){
            getime_type = ['立即取餐']
          }else{
            getime_type = ['立即取餐', '稍后取餐']
          }
          that.setData({ getime_type })
        }
      }
    })
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let nowdate = year + '-' + month + '-' + day
    detail[1].r = nowdate
    let carts = app.globalData.mealCarts
    this.setData({ cartsprice, carts, detail, shop_id})
  },
  submitOrder(e){
    let getime_index = this.data.getime_index
    let shop_id = this.data.shop_id
    let openid = wx.getStorageSync('openid');
    let orders = {
      getime_type: this.data.getime_type[getime_index],
      message: this.data.message,
      cartsprice: this.data.cartsprice,
      shop_id: shop_id,
      openid: openid,
      carts: this.data.carts
    }
    app.apiRequest('meal', 'submitOrder', {
      data: {orders},
      success: function (res) {
        if (res.data.result == 'OK') {
          console.log(res.data)
          let resdata = res.data
          let oid = resdata.oid
          if (resdata.paySign){
            // toPay
            wx.requestPayment({
              "timeStamp": resdata.timeStamp,
              "nonceStr": resdata.nonceStr,
              "package": resdata.package,
              "signType": resdata.signType,
              "paySign": resdata.paySign,
              success(res) {
                wx.navigateTo({ url: '../meal_order_detail/meal_order_detail?oid=' + oid })
              },
              fail(res) {
                wx.showModal({
                  title: res.errMsg,
                  content: '', showCancel: false,
                  //complete() {wx.navigateTo({url: '../meal_order_list/meal_order_list'})}
                })
              }
            })
          }else{
            wx.showModal({
              title: 'prepay_id error',
              content: '', showCancel: false,
              complete() { wx.navigateTo({ url: '../meal_order_detail/meal_order_detail?oid=' + oid })}
            })
          }
          
          
        }
      }
        
    })
  },
  getimeChange(e){
    let getime_index = e.detail.value
    this.setData({ getime_index })
  },
  binkMessageConfirm(e){
    this.setData({
      message: e.detail.value
    })
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