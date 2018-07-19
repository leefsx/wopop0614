import wech from '../widget.js';

const formOptionsConfig = {
    data: {
		options: [],
		haswarn: false,
        inner_style: '',
		title_style: '',
		_value_: {},
    },
	events: {
        onChange (e){
			let _value_ = {};
            const val = e.detail.value;
            if (this.data.param.type == 'radio') _value_[0] = val;
            else val.forEach(c => _value_[c] = c);
            this.setData({haswarn: false,_value_})
        },
    },
    methods: {
        parseStyle (ctype = 'inner'){
			let csstr = '';
			const app = getApp();
			let csobj = this.data.param[`${ctype}_style`];
			for (let k in csobj) {
				let v = csobj[k];
				if (typeof v == 'number') v = app.px2rpx(v);
                csstr += `${k}:${v};`
			}
			this.setData({[`${ctype}_style`]: csstr})
        },
    },
    onLoad: function () {
        // Parse 'normal/title-style'
		['inner','title'].forEach(c => this.parseStyle(c))
    }
}

module.exports = wech(formOptionsConfig)