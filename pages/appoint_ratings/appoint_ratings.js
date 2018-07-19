const app = getApp();

Page({
  data: {
	focus: false,
	score: 0,
	stars: [
	  'icon-wujiaoxing2',
	  'icon-wujiaoxing2',
	  'icon-wujiaoxing2',
	  'icon-wujiaoxing2',
	  'icon-wujiaoxing2'
	],
	message: '',
    prdimg: '',
	errmsg: '',
  },
  onLoad(options) {
	let errmsg = '';
	const id = options.id;
	const oid = options.oid;
	
	if (/^\d+$/.test(id) && /^\d+$/.test(oid)) {
	  this.argval = {id, oid}
	} else errmsg = '非法请求';
	
	this.setData({errmsg, prdimg: options.img || ''})
  },
  doRate(e) {
	  const idx = e.currentTarget.dataset.idx;
	  const stars = this.data.stars;
	  if (isNaN(parseInt(idx))) return false;
	  
	  for (let i = 0; i < 5; i++) {
		  let cn = i <= idx ? 'icon-wujiaoxing' : 'icon-wujiaoxing2';
		  stars[i] = cn
	  }
	  this.setData({score: idx,stars})
  },
  getMessage(e) {
	this.setData({message: e.detail.value})
  },
  onSubmit() {
    const param  = this.argval || {};
	const score = this.data.score;
    const message = this.data.message;
	const openid = wx.getStorageSync('openid');
	
	if (! Object.keys(param).length) {
      wx.showModal({
        title: '非法请求',
		content: '',showCancel: false
      });
	  return false
	}
	
    if (score < 1) {
      wx.showModal({
        title: '请选择评分',
		content: '',showCancel: false
      });
	  return false
    }
	
	if (! message.trim().length) {
      wx.showModal({
        title: '请填写评价',
		content: '',showCancel: false
      });
	  this.setData({focus: true});
	  return false
    }
	
	app.apiRequest('appoit', 'comments', {
	  data: Object.assign(param, {openid, score, message}),
	  method: 'POST',
	  success(res) {
		let resdata = res.data || {};
		if (resdata.result == 'OK') {
		  wx.navigateTo({url: '../appiont_order_list/appiont_order_list'})
		} else {
		  wx.showModal({
			title: resdata.errmsg || '请求失败',
			content: '',showCancel: false
		  })
		}
	  }
	})
  }
})