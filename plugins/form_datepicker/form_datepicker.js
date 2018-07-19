import wech from '../widget.js';

const formDatepickerConfig = {
    data: {
		haswarn: false,
        inner_style: '',
		_value_: '',
    },
	events: {
		timeChange (e){
			this.setData({_value_: e.detail.value});
		},
        onInput (e){
			const val = e.detail.value;
            this.setData({_value_: val});
            if (val.trim().length) this.setData({haswarn: false})
        },
		onBlur (e){
			let regexp = /\+/;
			const val = e.detail.value.trim();
			switch (this.data.param.inptype) {
				case 'date':
					regexp = /^\d{4}-\d{2}-\d{2}$/;
					break;
				case 'time':
					regexp = /^\d{2}\:\d{2}$/;
					break;
			}
            if (val.length && !regexp.test(val)) {
				this.setData({_value_: ''})
			}
		},
    },
    methods: {
        parseStyle (){
			const app = getApp();
			const csobj = this.data.param.inner_style;
			
			let csstr = '';
			for (let k in csobj) {
				let v = csobj[k];
				if (typeof v == 'number') v = app.px2rpx(v);
                csstr += `${k}:${v};`
			}
			this.setData({inner_style: csstr})
        },
    },
    onLoad (){
        // Parse 'style'
        this.parseStyle()
    }
}

module.exports = wech(formDatepickerConfig)