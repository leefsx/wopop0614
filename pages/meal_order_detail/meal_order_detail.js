let app = getApp()
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
    products: [],
    order: [],
    disass: [],
    getStatusId: '',
    now_status:'',
    status_no:'',
    status_str:'',
    take_number:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var oid = options.oid
    var openid = wx.getStorageSync('openid');
    var that = this
    if(oid){
      app.apiRequest('meal', 'order_detail', {
        data: { oid: oid },
        success: function (res) {
          if (res.data.result == 'OK') {
            that.setData({
              order: res.data.data,
              products:res.data.data.products,
              status_no:res.data.data.status_no,
              status_str:res.data.data.status_str
              //shop_n:res.data.data.shop_name
            })
            that.getStatus(oid);
            // wx.setNavigationBarTitle({
            //   title: that.data.shop_n
            // })
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
  //获取当前订单状态
  getStatus(oid) {
    let that = this
    app.apiRequest('meal', 'order_status', {
      data: { oid: oid },
      success: function (res) {
        if (res.data.result == 'OK') {
          let now_status_no = res.data.data.status_no || ''
          let now_status_str = res.data.data.status_str || ''
          let now_take_number = res.data.data.take_number || ''
          that.setData({
            status_no:now_status_no,
            status_str:now_status_str,
            take_number:now_take_number
          })
          setTimeout(() => {
            if(now_status_no!='9'){
              that.getStatus(oid);
            }
          }, 3000);

        }
      }
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