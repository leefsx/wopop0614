import wech from '../widget.js';

const formSelectorConfig = {
    data: {
		options: [],
		haswarn: false,
        inner_style: '',
		picker_style: '',
		_value_: '',
    },
	events: {
        pickerChange (e){
			this.setData({_value_: e.detail.value})
        },
    },
    methods: {
        parseStyle (){
			const app = getApp();
			let csstr = '', pickercs = '';
			let csobj = this.data.param.inner_style;
			for (let k in csobj) {
				let v = csobj[k];
				if (typeof v == 'number') v = app.px2rpx(v);
				csstr += `${k}:${v};`;
				// for 'picker-style'
				if (k == 'height') pickercs += `line-${k}:${v};`;
				else if (k == 'text-align') pickercs += `${k}:${v};`
			}
			this.setData({inner_style: csstr});
			if (pickercs.length) this.setData({picker_style: pickercs})
        },
		restructOptions (){
			let newopts = [];
			const _param_ = this.data.param;
			(_param_.options||[]).forEach(c => newopts.push(c.value));
			this.setData({options: newopts})
		}
    },
    onLoad: function () {
        // Parse 'style'
        this.parseStyle();
		// Restruct 'selector-options'
		this.restructOptions()
    }
}

module.exports = wech(formSelectorConfig)