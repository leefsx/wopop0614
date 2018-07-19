let app = getApp();

Page({
	data: {
		appoitinfo: {},
		userinfo: {},
		clerk: '',
		service_time: '',
		payid: '0',
		payment: '',
		frmdata: {},
		region: ['**省', '**市', '**区（县）'],
		unsubscribe_date: '',
	},
	
	onLoad(options) {
		this.parameters = Object.assign({}, options);
		//this.getOrderInfo(options)
	},
	
	onShow() {
		const options = Object.assign({}, this.parameters);
		if (Object.keys(options).length > 0) {
			this.getOrderInfo(options)
		} else {
			wx.showModal({
				title: '非法请求',
				content: '', showCancel: false,
				success() {wx.navigateBack()}
			})
		}
	},
	
	getOrderInfo(options) {
		let that = this;
		const service_time = options.service_time;
		app.apiRequest('appoit', 'index', {
			data: {
				id: options.product_id,
				cid: options.clerk_id,
				service_time,
			},
			method: 'POST',
			success(res) {
				let resdata = res.data || {};
				if (resdata.result == 'OK') {
					let _detail = resdata.detail;
					if (Array.isArray(_detail) && !_detail.length) {
						wx.showModal({
							title: '非法请求',
							content: '', showCancel: false,
							success() {wx.navigateBack()}
						});
						return false
					}
					const y2price = _detail.discount;
					_detail['relprice'] = parseFloat(y2price) > 0 ? y2price : _detail.price;
					that.setData({
						appoitinfo: _detail,
						clerk: resdata.clerk,
						service_time,
						payid: _detail.payment || '0',
						payment: that.getPayAlias(_detail.payment || '0'),
						userinfo: JSON.parse(_detail.userinfo_fields || '{}'),
						unsubscribe_date: _detail.unsubscribe_date || '1',
					})
				} else {
					let islogin = true, errmsg = resdata.errmsg;
					if (errmsg == 'unlogin') {
						islogin = false;
						errmsg = '请先登录'
					}
					wx.showModal({
						title: errmsg || '请求失败',
						content: '', showCancel: false,
						success() {
							if (islogin) wx.navigateBack()
							else wx.navigateTo({url: '../login/login'})
						}
					})
				}
			}
		})
	},
	
	getPayAlias(id) {
		const payalias = {"1": "微信支付","2": "到店支付"};
		return payalias[id] || ''
	},
	
	regionChange(e) {
		const region = e.detail.value;
		const frmdata = Object.assign(this.data.frmdata, {region});
		this.setData({region, frmdata})
	},
	
	wxPay(oid, total_price) {
		const openid = wx.getStorageSync('openid');
		if (openid.trim().length == 0) {
			wx.showModal({
				title: '"用户标识(Openid)"异常',
				content: '',showCancel: false,
				complete() {wx.navigateTo({url: '../login/login'})}
			});
			return false
		}
		
		wx.showLoading({mask: true,title: '微信支付'});
		// 预支付交易会话标识
		app.apiRequest('appoit', 'getprepayid', {
			data: {oid, total_price, openid},
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
							wx.navigateTo({url: '../ucenter/ucenter'})
						},
						fail(res) {
							wx.showModal({
								title: res.errMsg,
								content: '',showCancel: false,
								//complete() {wx.navigateTo({url: '../ucenter/ucenter'})}
							})
						}
					})
				} else if (resdata.result == 'ERROR') {
					switch (resdata.errmsg) {
						case 'unlogin':
							wx.navigateTo({url: '../login/login'});
							break;
						default:
							wx.showModal({
								title: '支付失败，请稍后重试',
								content: '',showCancel: false,
								//complete() {wx.navigateTo({url: '../ucenter/ucenter'})}
							});
							break;
					}
				}
			},
			fail() {
				wx.showModal({
					title: '支付失败，请稍后重试(fail)',
					content: '',showCancel: false,
					//complete() {wx.navigateTo({url: '../ucenter/ucenter'})}
				})
			},
			complete() {wx.hideLoading()}
		})
	},
	
	onInput(e) {
		let newval = {}, frmdata = {};
		const userinfo = this.data.userinfo;
		newval[e.target.id] = e.detail.value.trim();
		userinfo[e.target.id].error = false;
		frmdata = Object.assign(this.data.frmdata, newval);
		this.setData({frmdata, userinfo})
	},
	
	onSubmit(e) {
		let that = this, hasErr = false;
		// Validator
		const frmdata = that.data.frmdata,
    userinfo = that.data.userinfo;
    let formId = e.detail.formId
		for (let ky in userinfo) {
			let val = userinfo[ky];
			if ((val.required == 'true')
				&& !(frmdata[ky] || '').length) {
				hasErr = true;
				val.error = true
			} else val.error = false
		}
		that.setData({userinfo});
		
		// Create-order
		if (hasErr) return false;
		wx.showLoading({mask: true,title: '处理中...'});
		app.apiRequest('appoit', 'create_order', {
			data: {
				frmdata: JSON.stringify(frmdata),
				options: JSON.stringify(that.parameters),
        formId: formId
			},
			method: 'POST',
			success(res) {
				let resdata = res.data || {};
				if (resdata.result == 'OK') {
					// wxPay
					if (that.data.payid == '1') {
						that.wxPay(resdata.id, resdata.total_price)
					} else wx.navigateTo({url: '../ucenter/ucenter'})
				} else {
					wx.showModal({
						title: resdata.errmsg || '请求失败',
						content: '', showCancel: false,
					})
				}
			},
			complete() {
				wx.hideLoading()
			}
		})
	}
})