//app.js
let config = require("./static/config.js");
import { queue } from './wx-queue-request';
queue(5);

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var that = this
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var openid = wx.getStorageSync('openid');
    if (openid) {
      //console.log('oid:' + openid);
      that.getSignIn(openid);
    } else {
      wx.login({
        success: function (res) {
          if (res.code) {
            //发起网络请求
            let param = {
              code: res.code,
              apitoken: config.apitoken
            }
            that.apiRequest('weixin', 'get_wxaopenid', {
              data: param,
              success(res) {
                if (!res.data.errcode) {
                  wx.setStorageSync('openid', res.data.openid);
                  wx.setStorageSync('session_key', res.data.session_key);
                  if (res.data.openid) that.getSignIn(res.data.openid); 
                }
              }
            })
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      });
    }
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      var openid = wx.getStorageSync('openid');
      if (openid) {
        that.getSignIn(openid);
        typeof cb == "function" && cb(that.globalData.userInfo)
      }else{
        wx.showModal({
          title: '获取openid失败！',
          content: '请检查相关配置！',
        })
      }
    }
  },
  getSignIn: function (openid){
    if (!openid) return false; 
    var that = this
    that.apiRequest('weixin', 'signin', {
      data: {
        openid: openid
      },
      method: 'GET',
      success: function (res) {
        if (res.data.result == 'OK') {
          let userInfo = {
            nickName: res.data.weixin_nickname,
            avatarUrl: res.data.headphoto,
            account_money: res.data.account_money,
            account_points: res.data.account_points
          }
          that.globalData.cuser = res.data
          that.globalData.userInfo = userInfo
        }
      }
    })
  },
  globalData:{
    userInfo:null,
    cuser:[],
    carts:[],
    APISESSID:'',
	config,
  },
  onShow: function () {
    let that = this;
    wx.getSystemInfo({
      success: res => {
        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1) {
          config.tabBar.isIphoneX = true
        }

      }
    })
  }, 
  sendRequest: function(param, customSiteUrl){

  },
  apiRequest: function(apiclass, apimethod, params){
	let host = this.globalData.config.domain || '';
	let apitoken = this.globalData.config.checkcode || '';
  params.data.APISESSID = this.globalData.APISESSID || ''
  if (typeof params != 'object') params = {};
  var that = this
	const requestTask = wx.request({
		url: host+'/wxappapi/'+apiclass+'/'+apimethod,
		header: params.header || {'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'},
		data: Object.assign(params.data || {}, {apitoken}),
		dataType: params.dataType || 'json',
		method: params.method || 'GET',
    success: function (res) {
      typeof params.success == "function" && params.success(res)
      if (!that.globalData.APISESSID && res.data.APISESSID) that.globalData.APISESSID = res.data.APISESSID;
    },
    complete: params.complete || null,
    //params.success || null,
		fail: params.fail || null
	});
	return requestTask
  },
  moduleBindTap: function(obj){
	if (typeof obj != 'object'
	|| JSON.stringify(obj) == '{}') return false;
	
	let ftype = obj.type || 'none';
	if (ftype == 'none') return false;
  let fvalue = obj.param.value || '';
  let pagevalue = obj.param.pagevalue || '';
  let idsvalue = obj.param.idsvalue || '';
  let redirect=parseInt(obj.param.redirect) ||0;
  let isRedirect = redirect?true:false;
	switch (ftype) {
		case 'func':
			if (obj.param.type == 'callto') {
				if (!/^\d[0-9\-]+$/.test(fvalue)) return false;
				wx.makePhoneCall({
				  phoneNumber: fvalue
				})
      } else if (obj.param.type == 'coupon') {
        let _url = 'coupon'
        this.turnToPage(_url + '/' + _url, isRedirect)
      } else {
        let str = obj.param.type
        let arr = str.split('_');
        let typestr = ''
        fvalue = pagevalue
        if (arr[0] && arr[1] && arr[1]=='list'){
          typestr = arr[0] + '_category' 
        } else if (arr[0] && arr[1] && arr[1] == 'detail'){
          typestr = arr[0] + '_id' 
        } else if (str == 'getCoupon'){
          this.getCoupon(pagevalue)
          return false;
        } else {
          console.log('Type error!');
          return false
        }
        if (!typestr) return false;
        let ids = ''
        if(idsvalue.length > 0){
          ids = idsvalue.toString()
        }
          let _url = 'page' + fvalue;
          this.turnToPage(_url + '/' + _url + '?' + typestr + '=' + ids, isRedirect)
      }
			break;
		case 'page':
			if (/^\d+$/.test(fvalue)) {
				let _url = 'page' + fvalue;
        this.turnToPage(_url + '/' + _url, isRedirect)
      } else {
        this.turnToPage(fvalue + '/' + fvalue, isRedirect)
      }
			break;
	}
  },
  getCoupon: function(cid){
    if (cid) {
      this.apiRequest('user', 'gotcoupon', {
        data: { cid: cid },
        success: function (res) {
          if (res.data.result == 'OK') {
            wx.showToast({
              title: '领取成功',
              icon: 'success',
              duration: 2000
            })
            that.changActive('', 'nouse')
          } else if (res.data.errmsg == '2') {
            wx.showToast({
              title: '请先登录',
              icon: 'loading',
              duration: 2000
            })
            wx.navigateTo({
              url: '../login/login'
            })
          } else {
            let err = res.data.errmsg || '领取失败'
            wx.showToast({
              title: err,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: '优惠券ID错误',
        icon: 'none',
        duration: 2000
      })
    }
  },
turnToPage: function(url, isRedirect = false){
		let _url_ = '/pages/' + url;
		let tabPathArr=this.getTabPagePathArr();
		let isTabPage=false;
		for(let i=0;i<tabPathArr.length;i++){
			let curtabpage=tabPathArr[i];
			let tabpagepath='/pages/' + curtabpage+ '/' + curtabpage;
			if(_url_.indexOf(tabpagepath)===0){
				isTabPage=true;
				break;
			}
		}
		if(isTabPage){
			this.switchToTab(_url_);
		}else{
			if (isRedirect) wx.redirectTo({url: _url_})
			else wx.navigateTo({url: _url_})
		}
  },
  getTabPagePathArr: function(){
		return [];//this.globalData.config.tabBarPagePathArr;
  },
  switchToTab: function(url){
    wx.switchTab({
      url: url
    });
  },
  setPageTitle: function(title){
    wx.setNavigationBarTitle({
      title: title
    });
  },
  pageScrollTo : function( scrollTop ) {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: scrollTop
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      });
    }
  },
  toLocalTime : function(time){
    let date = new Date();
	date.setTime(time * 1000);
	return date.toLocaleDateString()
  },
  px2rpx : function(num){
	return (num * 2) + 'rpx'
  }
})