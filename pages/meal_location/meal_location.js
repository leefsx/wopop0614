const app = getApp();
const mkey = 'ZNFBZ-KQL6X-HSU4E-7YW3O-WGRIH-EDFT4';

Page({
	data: {
		shops: [],
		location: '',
		gettime: 'now',
		gettype: '0',
		gettypes: [
			{id: '0',checked: false,disabled: true,title: '现在，支付成功后在店内取餐'},
			{id: '1',checked: false,disabled: true,title: '稍晚，预约稍晚时间到店取餐'}
		],
		stime: '00:00',
		etime: '23:00',
		showtime: false,
	},
	
	_geoCoderBy (key, value, callback){
		const self = this;
		wx.request({
			url: 'https://apis.map.qq.com/ws/geocoder/v1/',
			data: {"key": mkey,[key]: value},
			success (res){
				callback.apply(self, [{
					"status": 'request:ok',
					"result": res.data.result
				}])
			},
			fail (){
				callback.apply(self, [{
					"status": 'request:fail',
					"result": {"errmsg": '地址解析失败'}
				}])
			}
		})
	},
	
	_getDistance (_from){
		const self = this;
		let toes = '', shops = self.data.shops || [];
		if (shops.length == 0) return false;
		shops.forEach(c => {
			c.selected = false;
			let locstr = c.location || '';
			if (! locstr.length) return true;
			toes += `${locstr};`
		});
		toes = toes.replace(/;$/, '');
		
		wx.request({
			url: 'https://apis.map.qq.com/ws/distance/v1/',
			data: {"mode": 'walking',"key": mkey,"from": _from,"to": toes},
			success (res){
				if (res.data.status != 0) return false;
				let idx = 0, el = res.data.result.elements;
				shops.forEach((c, i) => {
					if (! (c.location || '').length) return true;
					c._distance = el[idx].distance;
					c.distance = self._parseDistance(c._distance);
					idx++
				});
				shops.sort((a1, a2) => {
					let dist1 = parseFloat(a1._distance || '0'),
					dist2 = parseFloat(a2._distance || '0');
					return dist1 > dist2
				});
				shops[0].selected = true;
				self._initMealTime(0);
				self.setData({shops})
			}
		})
	},
	
	_parseDistance (n){
		let restr = '';
		if (n < 1000) restr = n.toFixed(2) + '米'
		else restr = (n / 1000).toFixed(2) + '千米'
		return restr
	},
	
	_parseTime (t){
		return t < 10 ? `0${t}` : t
	},
	
	_compareTime (t1, t2){
		t1 = parseInt(t1.replace(':', ''));
		t2 = parseInt(t2.replace(':', ''));
		if (t1 > t2) return 1
		else if (t1 == t2) return 0
		else return -1
	},
	
	_getShops (callback){
		const self = this;
		app.apiRequest('meal', 'shops', {
			data: {}, method: 'POST',
			success (res){
				let shops = res.data.shops || [];
				if (shops.length > 0) self.setData({shops});
				callback && callback.apply(self)
			}
		})
	},
	
	_initMealTime (idx){
		// for '取餐时间'
		let curshop = this.data.shops[idx],
		_type = curshop.getime_type || '';
		if (_type.length == 0) return false;
		
		let _types = _type.split(','),
		ttypes = this.data.gettypes,
		chkid = _types.length > 1 ? '0' : _type;
		ttypes.forEach(c => {
			c.checked = (chkid == c.id) ? true : false;
			c.disabled = (_types.findIndex(r=>r==c.id) > -1) ? false : true
		});
		this.setData({gettypes: ttypes});
		if (chkid == '1') {
			this.resetGetTime({
				detail: {value: '1'},
				currentTarget: {dataset: {sid: curshop.id}}
			})
		} else this.setData({showtime: false,gettype: '0',gettime: 'now'})
	},
	
	_checkMealTime (open_time){
		let gettype = this.data.gettype,
		[stime, etime] = (open_time || '').split('-');
		
		switch (gettype) {
			case '0': /*现在取餐*/
				this.setData({gettime: 'now'});
				if (!(stime && etime)) return true;
				const d = new Date();
				let ctime = this._parseTime(d.getHours());
				ctime += ':' + this._parseTime(d.getMinutes());
				if (this._compareTime(stime, ctime) == 1
					|| this._compareTime(etime, ctime) == -1) {
					wx.showModal({
						title: '门店已打烊，可预约明天的订单',
						content: '',showCancel: false
					});
					return false
				} else return true
				break;
			case '1': /*稍晚取餐*/
				if (/^\d{2}:\d{2}$/.test(this.data.gettime)) return true;
				wx.showModal({
					title: '请选择取餐时间',
					content: '',showCancel: false
				});
				return false
				break;
		}
	},
	
	resetGetTime (e){
		let itype = e.detail.value, sid = e.currentTarget.dataset.sid;
		let glbobj = {gettype: itype,showtime: (itype == '0')?false:true};
		if (itype == '1') {
			let curshop = this.data.shops.find(c => sid == c.id),
			[stime, etime] = (curshop.opening_hours || '').split('-');
			glbobj = Object.assign(glbobj, {
				gettime: '',
				stime: stime || '00:00',
				etime: etime || '23:00',
			})
		}
		this.setData(glbobj)
	},
	
	resetGetTimeVal (e){
		this.setData({gettime: e.detail.value})
	},
	
	tapSearchLoc (){
		const self = this;
		wx.chooseLocation({
			success (res){
				const lat = res.latitude, lng = res.longitude;
				self.setData({location: res.name});
				self._getDistance(`${lat},${lng}`)
			},
			fail (){
				self.setData({location: '定位失败'})
			}
		})
	},
	
	tapSelectShop (e){
		let shops = this.data.shops, sid = e.currentTarget.dataset.sid;
		shops.forEach(c => c.selected = (c.id == sid) ? true : false);
		this._initMealTime(e.currentTarget.dataset.index);
		this.setData({shops})
	},
	
	tapMeal (e){
		let shops = this.data.shops,
		sid = e.currentTarget.dataset.sid,
		curshop = shops.find(c => c.id == sid);
		
		// 检测'取餐时间'
		let chkres = this._checkMealTime(curshop.opening_hours);
		if (chkres == false) return chkres;
		// 保存'临时数据'
		const skey = wx.getStorageSync('openid') + '_mealshop';
		wx.setStorageSync(skey, Object.assign(curshop, {
			gettime: this.data.gettime,
			gettype: this.data.gettype,
		}));
		
		console.log(wx.getStorageSync(skey), 'redirectTo...')
		wx.redirectTo({
      url: '../meal_list/meal_list?shop_id=' + curshop.id
		})
	},
	
	onReady (){
		// 获取门店列表
		this._getShops(() => {
			const self = this;
			wx.getLocation({
				type: 'wgs84',
				success (res){
					let location = `${res.latitude},${res.longitude}`;
					self._geoCoderBy('location', location, res => {
						let status = res.status || 'request:fail';
						if (status == 'request:fail') {
							wx.showModal({
								title: res.result.errmsg || '定位失败',
								content: '',showCancel: false
							});
							return false
						}
						self._getDistance(location);
						self.setData({location: res.result.address})
					})
				},
				fail (){
					self.setData({location: '定位失败'})
				}
			})
		})
	},
	
	onLoad (options){
		// ...
	},
	
	onShow (){
		// ...
	},
})