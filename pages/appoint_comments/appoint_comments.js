let app = getApp();

Page({
	data: {
		lists: [],
		total: 0,
		page_id: 0,
		star: '/common/s.png',
		nostar: '/common/s1.png',
	},
	
	onLoad(options) {
		this.parameters = Object.assign({}, options)
	},
	
	onShow() {
		const options = Object.assign({}, this.parameters);
		if (Object.keys(options).length > 0) {
			this.getCommentsInfo(options)
		} else {
			wx.showModal({
				title: '非法请求',
				content: '', showCancel: false,
				complete() {wx.navigateBack()}
			})
		}
	},
	
	getCommentsInfo(options) {
		let that = this;
		app.apiRequest('appointment_detail', 'comments', {
			data: {
				product_id: options.product_id,
				page_id: that.data.page_id,
			},
			method: 'POST',
			success(res) {
				let resdata = res.data || {};
				if (resdata.result == 'OK') {
					let _lists = (resdata.data || {}).list || [];
					if (Array.isArray(_lists) && !_lists.length) {
						wx.showModal({
							title: '非法请求',
							content: '', showCancel: false,
							success() {wx.navigateBack()}
						});
						return false
					}
					
					const oldarr = that.data.lists;
					oldarr.push(..._lists);
					for (let i in oldarr) {
						let v = oldarr[i];
						let score = parseInt(v.score || '0');
						oldarr[i].stars = new Array(score);
						oldarr[i].nostars = new Array(5 - score);
						oldarr[i].create_time = that.parseTime(oldarr[i].create_time, 'yyyy-MM-dd hh:mm:ss');
					}
					
					that.setData({total: resdata.data.total,lists: oldarr})
				} else {
					let errmsg = resdata.errmsg;
					wx.showModal({
						title: errmsg || '请求失败',
						content: '', showCancel: false,
						complete() {wx.navigateBack()}
					})
				}
			}
		})
	},
	
	loadMore() {
		const curpage_id = parseInt(this.data.page_id);
		if (isNaN(curpage_id)) return false;
		
		this.setData({page_id: curpage_id + 1});
		const options = Object.assign({}, this.parameters);
		if (Object.keys(options).length > 0) {
			this.getCommentsInfo(options)
		} else {
			wx.showModal({
				title: '非法请求',
				content: '', showCancel: false,
				complete() {wx.navigateBack()}
			})
		}
	},
	
	parseTime(t, format) {
		if (isNaN(parseInt(t))) return t;
		const date = new Date(parseInt(t + '000'));
		const obj = {
			"M+": date.getMonth() + 1,
			"d+": date.getDate(),
			"h+": date.getHours(),
			"m+": date.getMinutes(),
			"s+": date.getSeconds(),
		};
		if (/(y+)/i.test(format)) {
			let _year = (date.getFullYear() + '').substr(4 - RegExp.$1.length);
            format = format.replace(RegExp.$1, _year)
		}
		
		for (let k in obj) {
			if (new RegExp('(' + k + ')', 'i').test(format)) {
				let curval = obj[k],
				_m = RegExp.$1.length == 1 ? curval : ('00' + curval).substr(('' + curval).length);
				format = format.replace(RegExp.$1, _m)
			}
		}
		
		return format
	},
	
})