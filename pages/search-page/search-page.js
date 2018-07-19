// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 'article',
    products: [],
    articles: [],
		pagerid: 1,
    styles: '',
    inputstyle: '',
    isWritting: false,
    searchTitle: [],
    searchBar: [
      { type: 'default', value: 'asc', alias: '综合' },
      { type: 'sales', value: 'asc', alias: '销量' },
      { type: 'totalprice', value: 'asc', alias: '价格' },
      { type: 'review', value: 'asc', alias: '评价' }
    ],
    sortby: { "type": "default", "value": "desc" }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let config = getApp().globalData.config.searchConfig
    let styles = config.style;
    for (var c in styles) {
      let nodestyle = ''
      let nodestyle2 = ''
      let imgstyle = ''
      let tmpobj = styles[c] || '';
      if (typeof c == 'undefined' || tmpobj == '' || c == 'width') continue;
      if (typeof tmpobj == 'number')
        tmpobj = getApp().px2rpx(tmpobj);
      let inputArr = ['height', 'background', 'color', 'border-radius']
      if (inputArr.indexOf(c) !== -1) {
        if (c == 'height') {
          nodestyle2 += c + ": " + getApp().px2rpx(styles[c] - 2) + ";";
          let imgHeight = (parseInt(tmpobj) - 24) + 'rpx'
          imgstyle = 'width:' + imgHeight + ';height:' + imgHeight + ';'
          this.setData({ imgstyle: imgstyle })
        } else {
          nodestyle2 += c + ": " + tmpobj + ";";
        }
      }

      nodestyle += c + ": " + tmpobj + ";";
      if (nodestyle.length > 0 || nodestyle2.length > 0) {
        let oldobj = this.data.styles || '';
        let oldobj2 = this.data.inputstyle || '';
        oldobj += nodestyle;
        oldobj2 += nodestyle2
        this.setData({ styles: oldobj, inputstyle: oldobj2 })
      }
    }
    let hotSearch = config.hotSearch
    let hotSearchArr = []
    if (hotSearch) {
      if (hotSearch.indexOf(',') > 0) {
        hotSearchArr = hotSearch.split(',')
      } else if (hotSearch.indexOf('，') > 0) {
        hotSearchArr = hotSearch.split('，')
      }
    }
    let type = config.dataSource || 'article'
    this.setData({
      type: type,
      config: config,
      hotSearchArr: hotSearchArr
    })
  },
  subSearch(opt){
    let keywords = this.data.keywords
    let type = this.data.type
    this.setData({
      isWritting: false,
      searchTitle: []
    })
    if (keywords){
      let opt = { keywords: keywords }
      if(type=='article'){
        this.loadArticle(opt)
      }else if(type == 'product'){
        this.loadProducts(opt)
      }else{
        return false
      }
    }else{
      return false
    }
    
  },
  subHotSearch(e) {
    let type = this.data.type
    let hotSearchArr = this.data.hotSearchArr
    let hotIndex = e.currentTarget.dataset.index
    if (hotSearchArr[hotIndex]){
      let keywords = hotSearchArr[hotIndex]
      this.setData({ keywords: keywords })
      let opt = { keywords: keywords }
        if (type == 'article') {
          this.loadArticle(opt)
        } else if (type == 'product') {
          this.loadProducts(opt)
        }
    } else {
      return false
    }
  },
  inputSearch(opt){
    let keywords = opt.detail.value
    let type = this.data.type
    if (keywords) {
      this.setData({
        keywords: keywords,
        isWritting: true
      })
    } else {
      this.setData({
        keywords: keywords,
        isWritting: false,
        searchTitle: []
      })
    }
    if (!keywords) return false
    let opts = {keywords: keywords, fr: 'input'}
    if(type == 'article'){
      this.loadArticle(opts)
    }else if(type == 'product'){
      this.loadProducts(opts)
    }else{
      return false
    }
  },
  keyDownSearch(e) {
    let type = this.data.type
    let searchTitle = this.data.searchTitle
    let index = e.currentTarget.dataset.index
    this.setData({
      isWritting: false,
      searchTitle: []
    })
    if (searchTitle[index]) {
      let opt = { keywords: searchTitle[index].title }
      if (type == 'article') {
        this.loadArticle(opt)
      } else if (type == 'product') {
        this.loadProducts(opt)
      }
    } else {
      return false
    }
  },
  navigateToDetail(e){
    let pageid = this.data.config.detailLink
    let type = this.data.type
    let typeid = ''
    if (type == 'article'){
      typeid = 'article_id'
    }else if(type == 'product'){
      typeid = 'product_id'
    }else{
      return false
    }
    if (/^[1-9]\d*$/.test(pageid)) {
      let artid = e.currentTarget.dataset.aid;
      let _url_ = '/pages/page' + pageid + '/page' + pageid;
      console.log(_url_ + '?' + typeid + '=' + artid)
      wx.navigateTo({
        url: _url_ + '?' + typeid + '=' + artid })
    }
  },
  loadArticle(opt, frmdata = {}){
    let app = getApp(), that = this;
    let glconfig = app.globalData.config;
    let data = {};
    
    data['keywords'] = opt.keywords;
    if (opt.fr == 'input') {
      data['search_type'] = 'title'
    }
    data = Object.assign(data, frmdata);
    this.setData({
      keywords: opt.keywords
    })
    let ispager = /^[1-9]{1}\d*$/.test(frmdata.page || 0) ? true : false;
    app.apiRequest('article_list', 'index', {
      data, method: 'POST',
      success(res) {
        if (opt.fr == 'input'){
          let searchTitle = res.data.data
          that.setData({ searchTitle })
          return false
        }
        let articles = res.data.data || [];
        if (articles.length == 0) {
          let image = '/static/icons/warning.png';
          wx.showToast({ title: '无相关文章', image })
        }
        if ('ERROR' == res.data.result || '') {
          that.setData({ errmsg: res.data.errmsg });
          return false
        }
        let _limit_title = 20;
        let _limit_desc = 20;
        articles.forEach((c, i) => {
          c.publish_time = app.toLocalTime(c.publish_time);
          if (_limit_title && _limit_title != 0) {
            c.title = c.title.slice(0, _limit_title)
          }
          if (_limit_desc && _limit_desc != 0) {
            c.intro = c.intro.slice(0, _limit_desc)
          }
          if (c.doc_image.length == 0)
            c.doc_image = glconfig.domain + "/template/default/images/effect1.png"
        });

        let _limit = 20;
        if (ispager) {
          that.data.articles.push(...articles);
          that.setData({ articles: that.data.articles });
          that.setData({ pagerid: that.data.pagerid + 1 })
        } else that.setData({ articles })
        that.setData({ pagerShow: articles.length < _limit ? false : true })
        
      },
      fail() { console.error("请求失败") }
    })
  },
  loadProducts(option, frmdata = {}) {
    let app = getApp(), that = this;
    let glconfig = app.globalData.config;
    let data = {};
    data['sortby'] = JSON.stringify(this.data.sortby);
    if (!option.keywords) data['keywords'] = this.data.keywords
    else data['keywords'] = option.keywords;
    if (option.fr == 'input') {
      data['search_type'] = 'title'
    }
    let desc_show = false
    data = Object.assign(data, frmdata);
    let ispager = /^[1-9]{1}\d*$/.test(frmdata.page || 0) ? true : false;
    app.apiRequest('product_list', 'index', {
      data, method: 'POST',
      success(res) {
        if (option.fr == 'input') {
          let searchTitle = res.data.data
          that.setData({ searchTitle })
          return false
        }
        let products = res.data.data || [];
        if(products.length==0){
          let image = '/static/icons/warning.png';
          wx.showToast({ title: '无相关产品', image })
        }
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
          if (c.doc_image.length == 0)
            c.doc_image = glconfig.domain + "/template/default/images/effect1.png";

          if (c.intro.replace(/(^s*)|(s*$)/g, "").length == 0) c.intro = "WxParsePlaceHolder";
          if (desc_show) {
            WxParse.wxParse('prdintro' + i, 'html', c.intro, that);
            if (i === maxln - 1)
              WxParse.wxParseTemArray("prdintroArr", 'prdintro', maxln, that)
          }
        });

        let _limit = 20;
        if (ispager) {
          //that.data.products.push(...products);
          that.setData({ products: products });
          that.setData({ pagerid: that.data.pagerid + 1 })
        } else that.setData({ products })
        that.setData({ pagerShow: maxln < _limit ? false : true })
      },
      fail() { console.error("请求失败") }
    })
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
    let type = this.data.type
    if(type == 'article'){
      this.loadArticles({}, { page })
    }else if(type == 'product'){
      this.loadProducts({}, { page })
    }
  },
  blur() {
    //this.setData({
    //  isWritting: false
    //})
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})