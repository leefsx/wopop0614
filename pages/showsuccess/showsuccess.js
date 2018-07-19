// pages/showsuccess/showsuccess.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oid: 0,
    total_price: 0,
    data: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id || 60
    let oid = options.oid
    let total_price = options.total_price || 0
    if(id){
      let that = this
      app.apiRequest('order', 'showsuccess', {
        data: {
          id: id,
          oid: oid
        },
        success: function (res) {
          if(res.data.result == 'OK'){
            let data = res.data.data
            if (res.data.data.total_amount) {
              total_price = res.data.data.total_amount
            }
            that.setData({
              oid: oid,
              data: data,
              para: data.paraval,
              total_price: total_price,
            })
          }else{
            let err = res.data.errmsg || '请求失败'
            wx.showModal({
              title: err,
              content: '',
            })
            wx.navigateBack()
          }
        }
      })
    
    }
  },
  submitOrder:function(param){
    let oid = this.data.oid
    if(oid){
      wx.showToast({
        title: '提交成功',
      })
      wx.redirectTo({
        url: '/pages/order_detail/order_detail?oid=' + oid,
      })
    }else{
      wx.showToast({
        title: '提交失败',
      })
    }
    
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