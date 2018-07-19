import wech from '../widget.js';
var WxParse = require('../../wxParse/wxParse.js');
const appointmentListConfig= {
  data: {
    // 组件私有数据
    param: {},
    searchBar: [
      { type: 'default', value: 'asc', alias: '综合' },
      { type: 'sales', value: 'asc', alias: '销量' },
      { type: 'totalprice', value: 'asc', alias: '价格' },
      { type: 'review', value: 'asc', alias: '评价' }
    ],
    products: [],
	pagerShow: true,
    styles: {},
    pagerid: 1
  },
  events: {
    // 私有模版事件响应
    navigateToDetail(e) {
      let pageid = this.data.param.linkto;
      if (/^[1-9]\d*$/.test(pageid)) {
        let prdid = e.currentTarget.dataset.productid;
        let _url_ = '/pages/page' + pageid + '/page' + pageid;
        wx.navigateTo({ url: _url_ + '?product_id=' + prdid })
      }
    },
    resortBy(e) {
      let index = e.target.dataset.sortidx;
      let tabobj = this.data.searchBar[index];
      let orderby = tabobj.type;
      let ordertype = tabobj.value;
      this.setData({ "barIdx": orderby });
      if (orderby != 'default')
        ordertype = (ordertype == 'asc') ? 'desc' : 'asc';

      // Restore 'searchbar.value'
      this.data.searchBar.forEach((c, i) => {
        if (i == index) {
          c.value = ordertype;
          return true
        }
        c.value = 'asc'
      });
      this.setData({ searchBar: this.data.searchBar })

      // Reload 'product-list'
      this.loadProducts({}, { orderby, ordertype })
    },
    loadMore() {
      let page = this.data.pagerid + 1;
      this.loadProducts({}, { page })
    }
  },
  methods: {
    parseStyle() {
      let config = this.data.param;
      ['title', 'summary', 'price', 'discount', 'serviceTimes', 'thumb', 'hadOrder', 'buy_now'].forEach((c) => {
        let nodestyle = "";
        let tmpobj = config[c] || {};
        for (let ky in tmpobj) {
          if (ky == 'title'){ continue; }
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
      console.log(this.data.styles.price)
    },
    loadProducts(option, frmdata = {}) {
      let app = getApp(), that = this;
      let glconfig = app.globalData.config;
      let data = {}, _param_ = that.data.param;
      data['sortby'] = JSON.stringify(_param_.sortby);
      let desc_show = _param_.display.desc || false
      data['data_source'] = JSON.stringify(_param_.data_source);
      data = Object.assign(data, frmdata);
      let ispager = /^[1-9]{1}\d*$/.test(frmdata.page || 0) ? true : false;
      app.apiRequest('appointment_list', 'index', {
        data, method: 'POST',
        success(res) {
          let products = res.data.data || [];
          if ('ERROR' == res.data.result || '') {
            that.setData({ errmsg: res.data.errmsg })
            return false
          }

          if (ispager) {
            let oldproducts = that.data.products
            products = oldproducts.concat(products)
          }
          let maxln = products.length;
          products.forEach((c, i) => {
            if (c.thumbnail.length == 0)
              c.thumbnail = glconfig.domain + "/template/default/images/effect1.png";
            if (c.summary.replace(/(^s*)|(s*$)/g, "").length == 0) c.summary = "WxParsePlaceHolder";
            if (desc_show) {
              WxParse.wxParse('prdintro' + i, 'html', c.summary, that);
              if (i === maxln - 1)
                WxParse.wxParseTemArray("prdintroArr", 'prdintro', maxln, that)
            }
          });
          let _limit = _param_.data_source.limit;
          if (ispager) {
            that.setData({ products: products });
            that.setData({ pagerid: that.data.pagerid + 1 })
          } else that.setData({ products })
          if (_param_.data_source.type == 'ids') {
            that.setData({ pagerShow: false })
          } else {
            that.setData({ pagerShow: maxln < _limit ? false : true })
          }
        },
        fail() { console.error("请求失败") }
      })
    }
  },
  onLoad(option) {
    this.loadProducts();
    this.parseStyle();
    console.log(this.data.styles.title)
  }
}
module.exports = wech(appointmentListConfig);