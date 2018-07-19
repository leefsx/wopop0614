import wech from '../widget.js';

const articleListConfig = {
    data: {
        articles: [],
        styles: {},
		pagerid: 1,
		pagerShow: true,
		errmsg: '加载中...',
		list_li_margin:'margin-bottom:0rpx;'
    },
	events: {
        navigateToDetail (e){
            let pageid = this.data.param.linkto;
            if (/^[1-9]\d*$/.test(pageid)) {
                let artid = e.currentTarget.dataset.articleid;
                let _url_ = '/pages/page'+pageid+'/page'+pageid;
                wx.navigateTo({url: _url_+'?article_id='+artid})
            }
        },
		loadMore (){
			let page = this.data.pagerid + 1;
			this.loadArticles({}, {page})
		}
    },
    methods: {
        parseStyle (){
            let config = this.data.param;
            ['title','category','date','desc','thumb','linode'].forEach((c) => {
                let nodestyle = "", morestyle = "";
                let tmpobj = config[c] || {};
                for (let ky in tmpobj) {
                    let val = tmpobj[ky];
                    if (typeof val == 'number')
                        val = getApp().px2rpx(val);

                    if (c == 'title' && ky =='margin-bottom'){
                      this.setData({'list_li_margin': 'margin-bottom:' + val+";"});
                    }
                    nodestyle += ky + ": " + val + ";";
					if (c == 'title' && ky == 'color') {
						morestyle += "color: " + val + ";";
					}
                }
                if (nodestyle.length > 0) {
                    let oldobj = this.data.styles;
                    oldobj[c] = nodestyle;
					if (morestyle.length) oldobj['more'] = morestyle;
                    this.setData({styles: oldobj})
                }
            })
        },
		loadArticles (option, frmdata = {}){
			let app = getApp(), that = this;
			let glconfig = app.globalData.config;
			let data = {}, _param_ = that.data.param;
			data['sortby'] = JSON.stringify(_param_.sortby);
			data['data_source'] = JSON.stringify(_param_.data_source);
      if (/^[1-9]\d*$/.test(option.article_category || 0))
        data['article_category'] = option.article_category;
      else if(option.article_category){
        _param_.data_source.value = option.article_category.split(',');
        data['article_category'] = option.article_category;
      }
      data['data_source'] = JSON.stringify(_param_.data_source);
			data = Object.assign(data, frmdata);
			let ispager = /^[1-9]{1}\d*$/.test(frmdata.page||0)?true:false;
			app.apiRequest('article_list', 'index', {
				data, method: 'POST',
				success (res){
					let articles = res.data.data || [];
					if ('ERROR' == res.data.result || '') {
						that.setData({errmsg: res.data.errmsg});
						return false
					}
					let _limit_title = _param_.data_source.titleLimit;
					let _limit_desc = _param_.data_source.descLimit;
					articles.forEach((c, i) => {
						c.publish_time = app.toLocalTime(c.publish_time);
						if (_limit_title && _limit_title != 0){
						  c.title = c.title.slice(0, _limit_title)
						} 
						if (_limit_desc && _limit_desc != 0){
						  c.intro = c.intro.slice(0, _limit_desc)
						}
						if (c.doc_image.length == 0)
							c.doc_image = glconfig.domain + "/template/default/images/effect1.png"
					});
					
					let _limit = _param_.data_source.limit;
					if (ispager) {
						that.data.articles.push(...articles);
						that.setData({articles: that.data.articles});
						that.setData({pagerid: that.data.pagerid + 1})
					} else that.setData({articles})
          if (_param_.data_source.type == 'ids') {
            that.setData({ pagerShow: false })
          } else {
            that.setData({ pagerShow: articles.length < _limit ? false : true })
          }
				},
				fail (){console.error("请求失败")}
			})
			
		}
    },
	onLoad (option){
		// Parse 'node-style'
        this.parseStyle();
		// Load 'article-list'
		this.setData({articles: []});
        this.loadArticles(option)
    }
}

module.exports = wech(articleListConfig)