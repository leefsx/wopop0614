const app = getApp();

Page({
  data: {
	btncolor: '',
    focus: false,
  },
  _showTips(text, complete) {
	wx.showModal({
	  title: '友情提醒',
	  content: text || '',
	  showCancel: false,
	  complete
	})
  },
  doRecharge(e) {
    const self = this, frmdata = e.detail.value;
	const openid = wx.getStorageSync('openid');
	
	if (openid.trim().length == 0) {
	  self._showTips('"用户标识(Openid)"异常', () => {
		wx.navigateTo({url: '../login/login'})
	  });
	  return false
	}
    if (!/^\d{1,}(\.\d{1,2})?$/.test(frmdata.amount||'')) {
	  self._showTips('请输入合法的充值金额', () => {
		self.setData({focus: true})
	  });
	  return false
	}
	
	wx.showLoading({mask: true,title: '处理中...'});
	// 预支付交易会话标识
	app.apiRequest('user', 'getprepayid', {
      data: {openid,"amount": frmdata.amount},
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
			  wx.showToast({
				title: '充值成功',
				complete() {
				  wx.navigateTo({url: '../ucenter/ucenter'});
				}
			  })
			},
			fail(res) {
			  self._showTips(res.errMsg)
			}
		  })
		} else if (resdata.result == 'ERROR') {
		  switch (resdata.errmsg) {
			case 'unlogin':
			  wx.navigateTo({url: '../login/login'});
			  break;
			case 'invalid':
			  self._showTips('请输入合法的充值金额');
			  break;
			default:
			  self._showTips('请求失败，请稍后重试');
			  break;
		  }
		}
      },
	  fail() {
        self._showTips('请求失败，请稍后重试')
      },
	  complete() {
		wx.hideLoading()
	  }
    })
  },
  onLoad(options) {
    const config = require('../../static/config.js');
    this.setData({btncolor: config.insidepage_themecolor || '#d80134'})
  },
})