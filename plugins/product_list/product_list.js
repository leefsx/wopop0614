import wech from '../widget.js';
var WxParse = require('../../wxParse/wxParse.js');

const productListConfig = {
    data: {
        products: [],
        styles: {},
		barIdx: 'default',
		pagerid: 1,
		pagerShow: true,
		searchBar: [
            {type: 'default',value: 'asc',alias: '综合'},
			{type: 'sales',value: 'asc',alias: '销量'},
			{type: 'totalprice',value: 'asc',alias: '价格'},
			{type: 'review',value: 'asc',alias: '评价'}
        ],
    errmsg: '加载中...',
    food: {
      "name": "",
      "good_ord": "0",
      "fir_ord": "0",
      "sec_ord": "1",
      "url": "/image/o1.jpg",
      "old_price": "￥0",
      "price": "￥0",
      "dec": "",
      "total_count": 200,
      "num": 1,
      "dec_detail": {
      }
    },
    attr_data: []
    },
	events: {
        navigateToDetail (e){
            let pageid = this.data.param.linkto;
            if (/^[1-9]\d*$/.test(pageid)) {
                let prdid = e.currentTarget.dataset.productid;
                let _url_ = '/pages/page'+pageid+'/page'+pageid;
                wx.navigateTo({url: _url_+'?product_id='+prdid})
            }
        },
        resortBy (e){
            let index = e.target.dataset.sortidx;
            let tabobj = this.data.searchBar[index];
		    let orderby = tabobj.type;
		    let ordertype = tabobj.value;
            this.setData({"barIdx": orderby});
            if (orderby != 'default')
                ordertype = (ordertype == 'asc')?'desc':'asc';

            // Restore 'searchbar.value'
            this.data.searchBar.forEach((c, i) => {
                if (i == index) {
                    c.value = ordertype;
                    return true
                }
                c.value = 'asc'
            });
            this.setData({searchBar: this.data.searchBar})
            
            // Reload 'product-list'
		    this.loadProducts({}, {orderby, ordertype})
        },
	   loadMore (){
          let page = this.$data.pagerid + 1;
          let product_category = this.$data.product_category
          this.loadProducts({ product_category: product_category}, {page})
        },
        directAddCartOK() {
          var that = this
          var carts = that.data.carts
          var cart_index = carts.length
          var detail_data = that.data.detail_data
          var skulist = that.data.skulist
          var attr_data = that.data.attr_data;
          var hadInCart = false
          var propertys = that.data.propertys
          var isFull = true
          var food = that.data.food
          var num = parseInt(food.num)
          let app = getApp()
          if (attr_data.length == 0) {
            isFull = false
          } else {
            for (var i = 0; i < attr_data.length; i++) {
              if (attr_data[i] == '' || attr_data[i] == undefined || attr_data.length < propertys.length) {
                isFull = false
                break
              }
              isFull = true
            }
          }
          if (!isFull) {
            wx.showToast({
              title: '请选择商品属性'
            })
          } else {
            wx.showLoading({
              title: '请求中',
              mask: true
            })
            if (cart_index > 0) {
              for (var i = 0; i < cart_index; i++) {
                if (detail_data.skuid && carts[i].cid == detail_data.id && carts[i].skuid == detail_data.skuid) {
                  var cartNum = parseInt(carts[i].num)
                  carts[i].num = cartNum += num;
                  hadInCart = true
                } else if (!detail_data.skuid && carts[i].cid == detail_data.id) {
                  var cartNum = parseInt(carts[i].num)
                  carts[i].num = cartNum += num;
                  hadInCart = true
                }
              }
            }
            if (hadInCart == false) {
              var send_data = {
                cid: detail_data.id,
                title: detail_data.name,
                image: detail_data.feature_img,
                num: that.data.food.num,
                price: detail_data.price,
                sum: detail_data.price,
                selected: true,
                max_kc: detail_data.num,
                skuid: detail_data.skuid || 0
              }
              carts.push(send_data)
            }
            app.globalData.carts = carts
            wx.showToast({
              title: '添加成功'
            })
            that.initCart()
          }
        },
        directAddCart(e) {
          var that = this
          var product_id = e.currentTarget.dataset.id;
          let app = getApp()
          app.apiRequest('product_detail','index',{
            data: { product_id },
            method: 'GET',
            success: function (res) {
              that.setData({
                detail_data: res.data.data,
                product_id: product_id,
                tradeRate: res.data.tradeRate,
                salesRecords: res.data.salesRecords,
                productMessage: res.data.productMessage,
                prevnext: res.data.PrevNext,
                propertys: res.data.newsku,
                skulist: res.data.skulist
              })
              var carts = that.data.carts
              var cart_index = carts.length
              var detail_data = res.data.data
              var skulist = res.data.skulist
              var attr_data = that.data.attr_data;
              var hadInCart = false
              var propertys = res.data.newsku;
              if (skulist && Object.keys(skulist).length > 0) {
                that.setData({
                  currentState: (!that.data.currentState)
                })
              } else {
                wx.showLoading({
                  title: '请求中',
                  mask: true
                })
                if (cart_index > 0) {
                  for (var i = 0; i < cart_index; i++) {
                    if (detail_data.skuid && carts[i].cid == detail_data.id && carts[i].skuid == detail_data.skuid) {
                      carts[i].num += that.data.food.num;
                      hadInCart = true
                    } else if (!detail_data.skuid && carts[i].cid == detail_data.id) {
                      carts[i].num += that.data.food.num;
                      hadInCart = true
                    }
                  }
                }
                if (hadInCart == false) {
                  var send_data = {
                    cid: detail_data.id,
                    title: detail_data.name,
                    image: detail_data.feature_img,
                    num: that.data.food.num,
                    price: detail_data.price,
                    sum: detail_data.price,
                    selected: true,
                    max_kc: detail_data.num,
                    skuid: detail_data.skuid || 0
                  }
                  carts.push(send_data)
                }
                app.globalData.carts = carts
                wx.showToast({
                  title: '添加成功'
                })
                that.initCart()
              }
            },
            fail: function () {
              console.log('fail');
            },
            complete: function () {
              console.log('complete!');
            }
          })
        },
        switchDetState(e) {
          let propertys = this.data.propertys;
          const idx = parseInt(e.currentTarget.dataset.index);
          const id = parseInt(e.currentTarget.dataset.id);
          const pid = parseInt(e.currentTarget.dataset.pid);
          const did = parseInt(e.currentTarget.dataset.did);
          var attr_data = this.data.attr_data;
          var skulist = this.data.skulist
          var detail_data = this.data.detail_data
          var isFull = true
          if (propertys[id].details[idx].detail_state != "disable" && propertys[id].details[idx].detail_state != "active") {
            propertys[id].details.forEach(function (e) {
              if (e.detail_state == "active") {
                e.detail_state = "";
              }
            })
            propertys[id].details[idx].detail_state = "active"
          }

          attr_data[id] = pid + ':' + did
          for (var i = 0; i < attr_data.length; i++) {
            if (attr_data[i] == '' || attr_data[i] == undefined) {
              isFull = false
              break
            }
            isFull = true
          }
          if (attr_data.length > 0 && attr_data.length == propertys.length && isFull) {
            var attr_str = attr_data.join(';')
            var skuid = skulist[attr_str]

            detail_data.price = skuid.price
            detail_data.num = skuid.quantity
            detail_data.skuid = skuid.id
          }
          this.setData({
            propertys: propertys,
            attr_data: attr_data,
            detail_data: detail_data
          })
        },
        changState() {
          this.setData({
            currentState: (!this.data.currentState)
          })
          this.initCart()
        },
        addCount() {
          let food = this.data.food;
          let num = food.num;
          let detail_data = this.data.detail_data
          const count = parseInt(detail_data.num);
          num = num + 1;
          if (num > count) {
            num = parseInt(count);
            wx.showToast({
              title: '数量超出范围~'
            })
          }
          food.num = num;
          this.setData({
            food: food
          });
        },
        minusCount() {
          let food = this.data.food;
          let num = food.num;
          if (num <= 1) {
            return false;
          }
          num = num - 1;
          food.num = num;
          this.setData({
            food: food
          });
        }
    },
    methods: {
        parseStyle (){
            let config = this.data.param;
            ['title','price','market_price','li_box','thumb'].forEach((c) => {
                let nodestyle = "";
                let tmpobj = config[c] || {};
                for (let ky in tmpobj) {
                    if (ky == 'title') continue;
                    let val = tmpobj[ky];
                    if (typeof val == 'number')
                        val = getApp().px2rpx(val);
                    
                    nodestyle += ky + ": " + val + ";";
                }
                if (nodestyle.length > 0) {
                    let oldobj = this.data.styles;
                    oldobj[c] = nodestyle;
                    this.setData({styles: oldobj})
                }
            })
        },
        loadProducts (option, frmdata = {}){
            let app = getApp(), that = this;
            let glconfig = app.globalData.config;
            let data = {}, _param_ = that.data.param;
            data['sortby'] = JSON.stringify(_param_.sortby);
            let desc_show = _param_.display.desc || false
            if (/^[1-9]\d*$/.test(option.product_category || 0)){
                data['product_category'] = option.product_category;

                that.setData({
                  product_category: option.product_category
                })
            }else if (option.product_category){
              _param_.data_source.value = option.product_category.split(',');
              data['product_category'] = option.product_category;
              _param_.data_source.type = 'category'
            }
            
            data['data_source'] = JSON.stringify(_param_.data_source);
            

            data = Object.assign(data, frmdata);
			let ispager = /^[1-9]{1}\d*$/.test(frmdata.page||0)?true:false;
            app.apiRequest('product_list', 'index', {
                data, method: 'POST',
                success (res){
                    let products = res.data.data || [];
					if ('ERROR' == res.data.result || '') {
						that.setData({errmsg: res.data.errmsg})
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
                            if (desc_show){
                            WxParse.wxParse('prdintro' + i, 'html', c.intro, that);
                            if (i === maxln - 1)
                                WxParse.wxParseTemArray("prdintroArr",'prdintro', maxln, that)
                            }
                    });
					
					let _limit = _param_.data_source.limit;
					if (ispager) {
						//that.data.products.push(...products);
						that.setData({products: products});
						that.setData({pagerid: that.data.pagerid + 1})
					} else that.setData({products})
					if(_param_.data_source.type == 'ids'){
						that.setData({ pagerShow: false })
					}else{
						that.setData({ pagerShow: maxln < _limit ? false : true })
					}
                },
                fail (){console.error("请求失败")}
            })
        }
    },
	onLoad (option){
    let app = getApp()
		// Parse 'node-style'
        this.parseStyle();
        // Load 'product-list'
        this.setData({products: []});
        this.loadProducts(option)
        if(!option.product_category){
          this.setData({product_category:0});
        }

        this.setData({
          carts: app.globalData.carts || [],
          showBar: this.$this.data.showBar,
          pagerid: 1
        })
    },
    initCart() {
      this.setData({
        detail_data: [],
        currentState: false,
        product_id: '',
        propertys: [],
        skulist: [],
        food: {
          "name": "",
          "good_ord": "0",
          "fir_ord": "0",
          "sec_ord": "1",
          "url": "/image/o1.jpg",
          "old_price": "￥0",
          "price": "￥0",
          "dec": "",
          "total_count": 200,
          "num": 1,
          "dec_detail": {
          }
        },
        attr_data: []
      })
    }
}

module.exports = wech(productListConfig)