const app = getApp();

Page({
  data: {
    lists: [],
	limit: 10,/* 每页显示记录数 */
	page_id: 1,/* 当前页码 */
	total: 0,/* 总的记录数 */
	pager_tips: '（上拉）加载更多',
  },
  _showTips(text, complete) {
	wx.showModal({
	  title: '友情提醒',
	  content: text || '',
	  showCancel: false,
	  complete
	})
  },
  _getSource() {
	const self = this;	
	app.apiRequest('user', 'getuserdeal', {
      data: {
		pageid: self.data.page_id,
		limit: self.data.limit,
      },
      success(res) {
		const resdata = res.data || {};
		if (resdata.result == 'OK') {
			const newdata = resdata.data || [];
			if (!(Array.isArray(newdata) && newdata.length)) return false;
			const curdata = self.data.lists;
			curdata.push(...newdata);
			self.setData({
			  lists: curdata,
			  total: resdata.total
			})
		} else if (resdata.result == 'ERROR') {
		  switch (resdata.errmsg) {
			case 'unlogin':
			  wx.navigateTo({url: '../login/login'});
			  break;
			case 'invalid':
			  self._showTips('无效的请求');
			  break;
			default:
			  self._showTips('请求失败，请稍后重试');
			  break;
		  }
		}
      },
	  fail() {
		self._showTips('请求失败，请稍后重试');
	  },
    })
  },
  onShow() {
    this._getSource()
  },
  onReachBottom() {
	const lists = this.data.lists;
	const total = this.data.total;
	if (total <= lists.length) return false;
	
	let pageid = parseInt(this.data.page_id);
	if (isNaN(pageid)) pageid = 0;
	this.setData({page_id: pageid + 1});
	this._getSource()
  },
})