import appointment_detail from '../../plugins/appointment_detail/appointment_detail.js';
var app = getApp();
var modrel={'appointment_detail':appointment_detail};
var plugins={"layer3296BAFB034C4D5DBD6852398C102990":{"id":"layer3296BAFB034C4D5DBD6852398C102990","pid":"7","father_id":"","type":"appointment_detail","left":0,"top":0,"width":100,"height":"auto","zindex":0,"pageid":"7","globalstyle":{"background-image":"none","background-color":"transparent","background-repeat":"repeat","background-position":"top left","border-color":"transparent","border-style":"none","border-width":0,"border-radius":0},"childprop":{"modclick":{"type":"none","param":{"type":"","value":""}},"data_source":{"title":"","value":[]},"display":{"title":true,"intro":true,"price":true,"discount":true,"hadOrder":true,"evaluation":true,"detail":true,"buynow":true,"serviceTimes":true,"availableNumber":true,"serviceHours":true,"payment":true},"title":{"color":"#535353","font-size":14,"font-weight":"normal","font-style":"normal","text-decoration":"none","text-align":"left"},"summary":{"color":"#657180","font-size":12,"font-weight":"normal","font-style":"normal","text-decoration":"none","text-align":"left"},"price":{"color":"#b5b5b5","font-size":12,"font-weight":"normal","font-style":"normal","text-decoration":"line-through","title":"\uffe5","line-height":20},"discount":{"color":"#ff8695","font-size":12,"font-weight":"normal","font-style":"normal","text-decoration":"none","title":"\uffe5","line-height":20},"thumb":{"height":200},"buy_now":{"color":"#fff","font-size":13,"font-weight":"normal","font-style":"normal","text-decoration":"none","text-align":"center","line-height":45,"background-color":"#ff0036","title":"\u7acb\u5373\u9884\u7ea6"},"traderate":{"color":"#6d9eeb","font-size":15,"font-weight":"bold","font-style":"italic","text-decoration":"underline","title":"\u8bc4\u4ef7"},"buy_now_actived":{"background-color":"#c71f3b"}}}};
var pageconf={
  data: {
    plugins:plugins,
	pageid: 'page7/page7',
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


