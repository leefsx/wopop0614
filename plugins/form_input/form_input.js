import wech from '../widget.js';

const formInputConfig = {
    data: {
        itype: 'text',
		haswarn: false,
        inner_style: '',
        placeholder_style: '',
		_value_: '',
    },
	events: {
        onInput (e){
			const val = e.detail.value;
            this.setData({_value_: val});
            if (val.trim().length) this.setData({haswarn: false})
        },
		onBlur (e){
			let regexp = /.*?/;
			const val = e.detail.value.trim();
            const itype = this.data.param.inptype;
			switch (itype) {
				case 'email':
					regexp = /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
					break;
				case 'mobile':
					regexp = /^1[3-9]\d{1}\d{8}$/;
					break;
			}
            if (val.length && !regexp.test(val)) {
				const image = '/static/icons/warning.png';
				this.setData({haswarn: true});
				wx.showToast({title: '请输入正确的数据格式',image})
			}
		},
    },
    methods: {
        parseStyle (ctype = 'inner'){
            let csstr = '', csobj = {};
            const config = this.data.param;
            if (ctype == 'inner') csobj = config.inner_style;
            else csobj = config.placeholder;
			
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
        // Parse 'normal/placeholder-style'
        this.parseStyle();
        this.parseStyle('placeholder');
        // Set 'input-type'
        const itype = this.data.param.inptype;
        if (itype == 'idcard') this.setData({itype})
    }
}

module.exports = wech(formInputConfig)