import wech from '../widget.js';
const navigationConfig = {
    data: {
      navigationShow: false,
      navigations: [],
      styles: {},
      errmsg: '加载中...'
    },
    events: {
      navigateToList (e){
        let pageid = e.currentTarget.dataset.pageid;
        if (/^[1-9]\d*$/.test(pageid)) {
            let _url_ = '/pages/page'+pageid+'/page'+pageid;
            wx.redirectTo({url: _url_})
        }
      },
      redirectTo(e) {
        let lnkobj = {};
        let index = e.currentTarget.dataset.index;
        let datas = this.data.datas[index]
        lnkobj['param'] = {};
        if (this.data.param.data_source == 'define') {
          lnkobj['type'] = datas.modclick.type;
          lnkobj['param']['value'] = datas.modclick.param.value;
	     lnkobj['param']['redirect'] =1;
        } else {
          lnkobj['type'] = 'page';
          lnkobj['param']['value'] = datas.id;
		lnkobj['param']['redirect'] =1;
        }
        getApp().moduleBindTap(lnkobj)
      },
      changeNavigationShow() {
        var state = this.data.navigationShow
        this.setData({
          navigationShow: !state
        })
      }
    },
    methods: {
      parseStyle (){
        let config = this.data.param;
        ['menu','global','title'].forEach((c) => {
            let nodestyle = "";
            let tmpobj = config[c] || {};
            for (let ky in tmpobj) {
              let val = tmpobj[ky];
              if (typeof val == 'number') val = getApp().px2rpx(val);
              if (ky == 'src') continue;
              if (c == 'global') {
                switch(ky){
                  case 'marginTop' : nodestyle += 'margin-top' + ": " + val + ";";
                    break;
                  case 'marginRight' : nodestyle += 'margin-right' + ": " + val + ";";
                    break;
                  case 'marginBottom' : nodestyle += 'margin-bottom' + ": " + val + ";";
                    break;
                  case 'marginLeft' : nodestyle += 'margin-left' + ": " + val + ";";
                    break;
                  case 'background' : nodestyle += 'background-color' + ": " + val + ";";
                    break;
                  default: nodestyle += ky + ": " + val + ";";
                }
              } else if(ky == 'background'){
                nodestyle += 'background-color' + ": " + val + ";";
              } else nodestyle += ky + ": " + val + ";";
            }
            if (nodestyle.length > 0) {
                let oldobj = this.data.styles;
                oldobj[c] = nodestyle;
                this.setData({ styles: oldobj })
            }
          })
      }
    },
    onLoad (option){
      // Parse 'node-style'
      this.parseStyle();
      let app = getApp(), that = this;
      let src = that.data.param.global.src;
      let datas = that.data.param.items;
      that.setData({ src: src })
      that.setData({datas: datas})
    },
    onHide () {
      this.setData({
        navigationShow: false
      })
    }
}
module.exports = wech(navigationConfig)
