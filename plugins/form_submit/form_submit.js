import wech from '../widget.js';

const formSubmitConfig = {
    data: {
		actived_style: '',
        inner_style: '',
    },
    methods: {
        parseStyle (ctype = 'inner'){
            let csstr = '', csobj = {};
            const config = this.data.param;
            if (ctype == 'inner') csobj = config.inner_style;
            else csobj = config.actived;
			
			const app = getApp();
			for (let k in csobj) {
				let v = csobj[k];
				if (typeof v == 'number') v = app.px2rpx(v);
                csstr += `${k}:${v};`
			}
			this.setData({[`${ctype}_style`]: csstr})
        },
    },
    onLoad: function () {
        // Parse 'normal/actived-style'
        this.parseStyle();
        this.parseStyle('actived')
    }
}

module.exports = wech(formSubmitConfig)