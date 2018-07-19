import wech from '../widget.js';

const categoryConfig = {
    data: {
        categories: [],
		styles: {},
		tabId: 0,
		scroll_left: 0,
		errmsg: '加载中...'
    },
    events: {
        navigateToList (e){
			let pageid = this.data.param.linkto;
			let ctype = this.data.param.data_source.type;
            if (/^[1-9]\d*$/.test(pageid)) {
                let catid = e.target.dataset.category_id;
                let _url_ = '/pages/page'+pageid+'/page'+pageid;
                wx.redirectTo({url: _url_+'?'+ctype+'_category='+catid})
            }
		}
    },
	methods: {
        parseStyle (){
            let config = this.data.param;
            ['border','global','title'].forEach((c) => {
                let nodestyle = "";
                let tmpobj = config[c] || {};
                for (let ky in tmpobj) {
					let val = tmpobj[ky];
					if (ky == 'selectedColor') continue;
					if (c == 'border') ky = 'border-bottom-' + ky;
					if (typeof val == 'number') val = getApp().px2rpx(val);
					// global.margin -> border.margin
                    if (c == 'global' && ky == 'margin') {
						this.data.styles.border += "margin: 0 " + val + ";";
					} else nodestyle += ky + ": " + val + ";";
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
		// Parse 'node-style'
        this.parseStyle();
		// Load 'article/product-category'
		let app = getApp(), that = this, data = {};
		data['param'] = JSON.stringify(that.data.param.data_source);
		// for 'selectedColor'
		let ctype = that.data.param.data_source.type || 'article';
        that.setData({tabId: option[ctype+'_category'] || 0});
		
		app.apiRequest('category', 'index', {
			data, method: 'POST',
			success (res){
				let categories = [];
				if ('ERROR' == res.data.result || '') {
					that.setData({errmsg: res.data.errmsg})
					return false
				}
				res.data.data.forEach((c) => {
					categories.push(c.obj)
				});
				that.setData({categories})
			},
			fail (){console.error("请求失败")}
		})
	}
}

module.exports = wech(categoryConfig)