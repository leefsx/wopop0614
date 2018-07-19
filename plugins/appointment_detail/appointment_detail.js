import wech from '../widget.js';
var WxParse = require('../../wxParse/wxParse.js');
const appointmentDetailConfig = {
  data: {
    close:"/common/index.png",
    detail: {},
    styles: {},
    chooseSize: false,
    animationData: {},
    more: "500",
    opentime: "8:00-21:00",
    indeximg: "/common/index.png",
    phoneimg: "/common/phone.png",
    assess: "200",
    order: "160",
    start: "/common/s.png",
	nostar: '/common/s1.png',
	scores: '0%',
	//stars: [],
	//nostars: [],
    accountList: [],
	commentsUrl: '/pages/appoint_comments/appoint_comments',
    clerks: [],
    workerId: 0,
    service_date: '',
    service_time: ''
  },
  methods: {
    parseStyle() {
      let config = this.data.param;
      ['title', 'summary', 'price', 'discount', 'property', 'thumb','buy_now'].forEach((c) => {
        let nodestyle = "";
        let tmpobj = config[c] || {};
        for (let ky in tmpobj) {
          let val = tmpobj[ky];
          if (typeof val == 'number')
            val = getApp().px2rpx(val);

          nodestyle += ky + ": " + val + ";";
        }
        if (nodestyle.length > 0) {
          let oldobj = this.data.styles;
          oldobj[c] = nodestyle;
          this.setData({ styles: oldobj })
        }
      })
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
    loadProducts(option, frmdata = {}) {
      let product_id = option.product_id
      if (!product_id) return false
      let app = getApp()
      let that = this
      app.apiRequest('appointment_detail', 'index', {
        data: { product_id },
        success(res) {
          let detail = res.data.data || {};
          let clerks = res.data.clerks
          let workerId = 0
          if (clerks.length > 0) {
            workerId = clerks[0].id
            if (clerks[0].service_time){
              detail.timeArr = clerks[0].service_time
            }
          }
          if ('ERROR' == res.data.result || '') {
            that.setData({ detail: { "errmsg": res.data.errmsg }});
            wx.hideLoading()
            return false
          }
		  
		  const prdmesge = res.data.productMessage || {};
		  let score = 0, listarr = prdmesge.list || [];
		  if (listarr.length) {
			  //score = parseInt(listarr[0].score || '0');
			  listarr[0].create_time = that.parseTime(listarr[0].create_time, 'yyyy-MM-dd hh:mm:ss');
		  }
          that.setData({
            detail: detail,
            clerks: clerks,
			accountList: listarr,
			more: prdmesge.total || 0,
			scores: prdmesge.score || '0%',
			//stars: new Array(score),
			//nostars: new Array(5 - score),
      workerId: workerId
          });
          var pageobj = that.$this;
          var layerid = that.$scope;
          if (detail.description == null) detail.description = ''
          if (detail.summary == null) detail.summary = ''
          WxParse.wxParse(layerid + '.prdsummary', 'html', detail.summary, pageobj, 5);
          WxParse.wxParse(layerid + '.prdintro', 'html', detail.description, pageobj, 5);
          /*
          that.data.prdintro = pageobj.data[layerid].prdintro;
          // for 'product-description'
          let desctitle = [], prdescobj = [];
          if (Array.isArray(detail.description)) {
            prdescobj = detail.description
          } else {
            prdescobj = JSON.parse(detail.description)
          }
          for (var i in prdescobj) {
            let vobj = prdescobj[i];
            desctitle.push({ "title": vobj.title });

            WxParse.wxParse(layerid + '.prdescarr[' + i + ']', 'html', vobj.desc, pageobj, 10)
            that.data['prdescarr'][i] = pageobj.data[layerid]['prdescarr'][i];
          }
          that.setData({ desctitle });
          */
          wx.hideLoading()
        },
        complete: function () {
          wx.hideLoading()
        },
        fail() {
          that.setData({
            detail: { errmsg: '未找到匹配数据' }
          })
        }
      })
    }
  },
  events: {
    navigateToDetail(e) {
      let pageid = this.data.param.linkto;
      if (/^[1-9]\d*$/.test(pageid)) {
        let prdid = e.currentTarget.dataset.productid;
        let _url_ = '/pages/page' + pageid + '/page' + pageid;
        wx.navigateTo({ url: _url_ + '?product_id=' + prdid })
      }
    },
    loadMore() {
      let page = this.data.pagerid + 1;
      let product_category = this.data.product_category
      this.loadProducts({}, { page })
    },
    chooseSezi(e) {
      var that = this;
      var animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'linear'
      })
      that.animation = animation
      animation.translateY(200).step()
      that.setData({
        animationData: animation.export(),
        chooseSize: true
      })
      setTimeout(function () {
        animation.translateY(0).step()
        that.setData({
          animationData: animation.export()
        })
      }, 200)
    },
    close: function (e) {
      var that = this;
      var animation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'linear'
      })
      that.animation = animation
      animation.translateY(200).step()
      that.setData({
        animationData: animation.export()

      })
      setTimeout(function () {
        animation.translateY(0).step()
        that.setData({
          animationData: animation.export(),
          chooseSize: false
        })
      }, 1000)
    },
    chooseWorker(e){
      let current = e.detail.current
      let clerks = this.data.clerks
      let detail = this.data.detail
      if (clerks[current]) {
        if (clerks[current].service_time) {
          detail.timeArr = clerks[current].service_time
        }
        this.setData({ workerId: clerks[current].id, detail: detail })
      }
    },
    selDates(e) {
      let val = e.currentTarget.dataset.val;
      if (val) {
        this.setData({
          service_date: val
        })
      }
    },
    selTimes(e){
      let val = e.currentTarget.dataset.val;
      if (val) {
        this.setData({
          service_time: val
        })
      }
    },
    submitOrder(e){
      let dates = this.data.service_date
      let times = this.data.service_time
      let workerId = this.data.workerId
      if (!dates) {
        wx.showModal({
          title: '提交错误',
          content: '请选择日期',
        })
        return false
      }
      if (!times) {
        wx.showModal({
          title: '提交错误',
          content: '请选择时间',
        })
        return false
      }
      let service_time = dates + ' ' + times
      let detail = this.data.detail
      let url = '/pages/appoint_order/appoint_order?amount=1&product_id=' + detail.id + '&clerk_id=' + workerId + '&service_time=' + service_time
      wx.navigateTo({
        url: url,
      })
    }


  },
  onLoad(option) {
    wx.showLoading({ 
      title: '加载中',
      mask: true
    })
    this.setData({
      detail: {},
      showBar: this.$this.data.showBar,
      chooseSize: false
    })
    // Parse 'node-style'
    this.parseStyle();
    // Load 'product-detail'
    let that = this, product_id = 0;
    let dsval = that.data.param.data_source.value;
    if (/^[1-9]\d*$/.test(option.product_id || 0)) {
      product_id = option.product_id;
    } else if (Array.isArray(dsval) && dsval.length > 0)
      product_id = parseInt(dsval[0]);

    this.loadProducts({ product_id })
    wx.hideLoading()
  }
}

module.exports = wech(appointmentDetailConfig)