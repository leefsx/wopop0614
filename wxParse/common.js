var app = getApp()

function get_cuser(obj){
  if (app.globalData.cuser.length){
    typeof obj.success == "function" && obj.success(app.globalData.cuser)
    return app.globalData.cuser
  }else{
    var openid = wx.getStorageSync('openid');
    console.log(openid)
    if (openid) {
      app.apiRequest('weixin', 'signin',{
        data: { openid: openid },
        success: function (res) {
          if (res.data.result == 'OK') {
            app.globalData.cuser = res.data
            app.globalData.hadlogin = true
            typeof obj.success == "function" && obj.success(res.data)
            return res.data
          } else {
            typeof obj.success == "function" && obj.success(false)
          }
        },
        fail: function () {
          typeof obj.success == "function" && obj.success(false)
        }
	  })
    }else{
      typeof obj.success == "function" && obj.success(false)
    }
  }
  
}

function get_now(){
  var myDate = new Date();
  var year = myDate.getFullYear();
  var month = myDate.getMonth();
  var day = myDate.getDate();
  var hour = myDate.getHours();
  var minute = myDate.getMinutes();
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}
/* 支付   */
function pay(param) {
  wx.requestPayment({
    timeStamp: param.timeStamp,
    nonceStr: param.nonceStr,
    package: param.package,
    signType: param.signType,
    paySign: param.paySign,
    success: function (res) {
      // success  
      app.apiRequest('order', 'getPayStatus',{
        data: { oid: param.oid },
        success: function (res) {
        },
        fail: function () {
        }
      })
       
    },
    fail: function (res) {
      // fail  
      console.log("支付失败")
    },
    complete: function () {
      // complete  
      wx.redirectTo({
        url: '../order_detail/order_detail?oid=' + param.oid,
      })
    }
  })
}
function wxPay(oid, total_price, type ='appoit') {
  const openid = wx.getStorageSync('openid');
  if (openid.trim().length == 0) {
    wx.showModal({
      title: '"用户标识(Openid)"异常',
      content: '', showCancel: false,
      complete() { wx.navigateTo({ url: '../login/login' }) }
    });
    return false
  }

  wx.showLoading({ mask: true, title: '微信支付' });
  // 预支付交易会话标识
  let classType = type ? type : 'appoit'
  app.apiRequest(classType, 'getprepayid', {
    data: { oid, total_price, openid },
    method: 'POST',
    success(res) {
      const resdata = res.data || {};
      if (resdata.result == 'OK') {
        // toPay
        wx.requestPayment({
          "timeStamp": resdata.timeStamp,
          "nonceStr": resdata.nonceStr,
          "package": resdata.package,
          "signType": resdata.signType,
          "paySign": resdata.paySign,
          success(res) {
            if (classType == 'meal'){
              wx.navigateTo({ url: '../meal_order_list/meal_order_list' })
            }else{
              wx.navigateTo({ url: '../ucenter/ucenter' })
            }
          },
          fail(res) {
            wx.showModal({
              title: res.errMsg,
              content: '', showCancel: false,
              //complete() {wx.navigateTo({url: '../ucenter/ucenter'})}
            })
          }
        })
      } else if (resdata.result == 'ERROR') {
        switch (resdata.errmsg) {
          case 'unlogin':
            wx.navigateTo({ url: '../login/login' });
            break;
          default:
            wx.showModal({
              title: '支付失败，请稍后重试',
              content: '', showCancel: false,
              //complete() {wx.navigateTo({url: '../ucenter/ucenter'})}
            });
            break;
        }
      }
    },
    fail() {
      wx.showModal({
        title: '支付失败，请稍后重试(fail)',
        content: '', showCancel: false,
        //complete() {wx.navigateTo({url: '../ucenter/ucenter'})}
      })
    },
    complete() { wx.hideLoading() }
  })
}
module.exports.get_cuser = get_cuser
module.exports.get_now = get_now
module.exports.pay = pay
module.exports.wxPay = wxPay
