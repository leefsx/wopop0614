import wech from '../widget.js';
var WxParse = require('../../wxParse/wxParse.js');

const articleDetailConfig = {
    data: {
        detail: {},
        styles: {}
    },
    methods: {
        parseStyle (){
            let config = this.data.param;
            ['title','info','detail'].forEach((c) => {
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
                    this.setData({styles: oldobj})
                }
            })
        }
    },
	onLoad (option){
		wx.showLoading({
			title: '加载中',
			mask: true
		})
		this.setData({
			detail: {},
			artdetail: ''
		})
		// Parse 'node-style'
        this.parseStyle();
        // Load 'article-detail'
        let app = getApp(), that = this, article_id = 0;
        let dsval = that.data.param.data_source.value;
		if (/^[1-9]\d*$/.test(option.article_id || 0)) {
			article_id = option.article_id;
        } else if (Array.isArray(dsval) && dsval.length > 0)
            article_id = parseInt(dsval[0]);
        
        app.apiRequest('article_detail', 'index', {
            data: {article_id},
            success (res){
                let detail = res.data.data || {};
				if ('ERROR' == res.data.result || '') {
					that.setData({detail: {"errmsg": res.data.errmsg}});
					wx.hideLoading()
					return false
				}
                detail.publish_time = app.toLocalTime(detail.publish_time);
                that.setData({detail});
			wx.hideLoading()
			var pageobj=that.$this;
			var detailkey = that.$scope + ".artdetail";
			WxParse.wxParse(detailkey, 'html', detail.content, pageobj, 5)
			that.data.artdetail = pageobj.data[that.$scope].artdetail
            },
            complete: function () {
              wx.hideLoading()
            },
            fail (){
                that.setData({
                    detail: {errmsg: '未找到匹配数据'}
                })
            }
        })
    }
}

module.exports = wech(articleDetailConfig)