import product_detail from '../../plugins/product_detail/product_detail.js';
var app = getApp();
var modrel={'product_detail':product_detail};
var plugins={"layer177601FB5BE16EA0A38AE36444CEC8EB":{"id":"layer177601FB5BE16EA0A38AE36444CEC8EB","pid":"5","father_id":"","type":"product_detail","left":0,"top":0,"width":100,"height":"auto","zindex":0,"pageid":"5","globalstyle":{"background-image":"none","background-color":"transparent","background-repeat":"repeat","background-position":"top left","border-color":"transparent","border-style":"none","border-width":0,"border-radius":0},"childprop":{"data_source":{"title":"","value":[]},"display":{"title":true,"intro":true,"price":true,"market_price":true,"attr":true,"detail":true,"addtocart":true,"buynow":true,"customer_rating":true,"purchase_record":true,"buyer_faq":true},"title":{"color":"#535353","font-size":14,"font-weight":"bold","font-style":"normal","text-decoration":"none","text-align":"left","line-height":30},"price":{"color":"#88bd79","font-size":18,"font-weight":"normal","font-style":"normal","text-decoration":"none","title":"\u60ca\u559c\u4ef7\uff1a"},"market_price":{"color":"#c9c9c9","font-size":12,"font-weight":"normal","font-style":"normal","text-decoration":"none","title":"\u5e02\u573a\u4ef7\uff1a"},"property":{"color":"#666560","font-size":14,"font-weight":"normal","font-style":"normal","text-decoration":"none","text-align":"left","line-height":50},"thumb":{"height":200},"buy_now":{"color":"#fff","font-size":18,"font-weight":"bold","font-style":"normal","text-decoration":"underline","text-align":"right","line-height":50,"background-color":"#4a86e8","title":"\u8d2d\u4e70","background-image":"http:\/\/sitestar2.wopop.com\/upload\/ipad_pro_os8r.jpg"},"buy_now_actived":{"background-color":"#ff0000"},"add_cart":{"color":"#666","font-size":18,"font-weight":"bold","font-style":"italic","text-decoration":"none","text-align":"left","line-height":50,"background-color":"#ffff00","title":"\u52a0\u5165\u8d2d\u7269","background-image":""},"add_cart_actived":{"background-color":"#ff00ff"}}}};
var pageconf={
  data: {
    plugins:plugins,
	pageid: 'page5/page5',
	showBar: false,
	tabs: {}
  },
  onLoad: function(o){
    let curpage = this.data.pageid;
    let tabs = getApp().globalData.config.tabBar || {};
    if (tabs.list) {
      this.setData({tabs});
      let _has_ = tabs.list.findIndex(c => {
		const lnkid = c.pagePath;
        return lnkid == curpage
      });
      this.setData({
        showBar: _has_ > -1 ? true : false
      })
    }
  },
  viewtap: function(e){
    var layerid=e.currentTarget.dataset.layerid;
    var plugindata=this.data.plugins[layerid];
    if(plugindata){
      var modclick=plugindata.childprop.modclick;
      app.moduleBindTap(modclick);
    }
  },
  switchTab: function(e){
	let url = e.currentTarget.dataset.url;
	getApp().turnToPage(url, true)
  },
  formReset: function(form){
	if (!Array.isArray(form)) return false;
	form.forEach(c => {
	  let _default_ = null;
	  switch (typeof c.reval) {
		case 'string': _default_ = '';break;
		case 'number': _default_ = -1;break;
		case 'object':
		  _default_ = Array.isArray(c.reval)?[]:{};
		  break;
	  }
	  let newobj = {[`${c.id}._value_`]: _default_};
	  // for 'chooseImage'
	  const pluginobj = this.data[c.id]||{};
      if (pluginobj.isImageFile === true) {
		newobj[`${c.id}.showClear`] = false;
		newobj[`${c.id}.inptext`] = pluginobj.param.inpval
      }
	  this.setData(newobj)
	})
  },
  formSubmit: function(e){
    // 表单验证
	const frmid = e.currentTarget.dataset.id;
	let formId = e.detail.formId;
	if (!/^[a-z0-9]+$/i.test(frmid)) return false;
	let errln = 0, formmap = [], uploading = [];
	const frmdata = e.detail.value;
	const image = '/static/icons/warning.png';
	if (! Object.keys(frmdata).length) return false;
	for (let k in frmdata) {
	  const dataobj = this.data[k];
	  formmap.push({id: k,reval: dataobj._value_});
	  if (dataobj.isUploading === true) uploading.push(k);
      if (true != dataobj.param.required||false) continue;
      if (frmdata[k].length == 0) {
        errln++;
        let newobj = {[`${k}.haswarn`]: true};
        this.setData(newobj)
      }
	}
	if (errln > 0) wx.showToast({title: '请先完善表单数据',image})
	else if (uploading.length > 0) {
      wx.showToast({title: '正在传送文件，请稍后再试',icon: 'none'})
	} else {
	  const self = this;
	  const submitips = e.detail.target.dataset.tips;
	  wx.showLoading({title: '处理中',mask: true});
	  app.apiRequest('form_submit', 'index', {
		method: 'POST',
		data: {frmid, frmdata: JSON.stringify(frmdata), formId},
		success (res){
		  wx.hideLoading();
		  if (res.data.result == 'ERROR') {
			wx.showToast({title: res.data.errmsg,image});
			return false
		  }
		  wx.showToast({
			title: submitips,
			icon: 'success',
			complete (){
			  self.formReset(formmap)
			}
		  })
		},
		fail (exp){
		  wx.showToast({
			title: exp.errMsg,
			icon: 'none',
			duration: 2500,
			complete (){
				wx.hideLoading()
			}
		  })
		},
	  })
	}
  },
	onShareAppMessage: function(res){}
}
for(var modid in plugins){
  (function(){
    var moddata=plugins[modid];
    var cls=modrel[moddata.type];
	if(cls){
		cls().install(pageconf, {scope:modid,
		static:{
		  param:moddata.childprop,
		  layerid: modid
		}
		})
	}
  })(modid)
}
Page(pageconf)


