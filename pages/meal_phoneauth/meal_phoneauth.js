const app = getApp();

Page({
	data: {
		expr: '',
		expr_val: '',
		phone: '',
		yzcode: '',
	},
	
	_createExpr (){
		let n1 = Math.floor(Math.random() * 9 + 1),
		n2 = Math.floor(Math.random() * 9 + 1);
		this.setData({
			expr: `${n1} + ${n2}`,
			expr_val: n1 + n2,
		})
	},
	
	tapResetExpr (){
		this._createExpr()
	},
	
	resetInput (e){
		let itype = e.currentTarget.dataset.itype;
		this.setData({[itype]: e.detail.value})
	},
	
	tapGetPhone (){
		let phone = this.data.phone,
		yzcode = this.data.yzcode;
		
		if (!/^[1-9]{1}\d{10}$/.test(phone)) {
			wx.showModal({
				title: '请输入正确的手机号码',
				content: '',showCancel: false
			});
			return false
		}
		
		if (yzcode != this.data.expr_val) {
			wx.showModal({
				title: '请输入正确的计算值',
				content: '',showCancel: false
			});
			return false
		}
		
		const openid = wx.getStorageSync('openid');
		app.apiRequest('meal', 'setphone', {
			data: {openid, phone}, method: 'POST',
			success (res){
				let resdata = res.data || {};
				if (resdata.result == 'OK') {
					wx.setStorageSync(`${openid}_mealphone`, phone)
					wx.redirectTo({
            url: '../meal_list/meal_list'
					}) 
				} else {
					wx.showModal({
						title: resdata.errmsg || '请求失败',
						content: '', showCancel: false
					})
				}
			}
		})
	},
	
	onShow (){
		this._createExpr()
	},
})