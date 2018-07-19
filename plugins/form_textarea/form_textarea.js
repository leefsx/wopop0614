import wech from '../widget.js';

const formTextareaConfig = {
    data: {
        inner_style: '',
        placeholder_style: '',
		box_align: '',
		_value_: '',
    },
	events: {
        onInput (e){
            this.setData({_value_: e.detail.value})
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
		flexAlign (){
			let align = '';
			switch (this.data.param['text-align']) {
				case 'left': align = 'flex-start';break;
				case 'center': align = 'center';break;
				case 'right': align = 'flex-end';break;
			}
			if (align.length) this.setData({box_align: `justify-content:${align};`})
		},
    },
    onLoad: function () {
        // Parse 'normal/placeholder-style'
        this.parseStyle();
        this.parseStyle('placeholder');
		// Into 'text-align'
		this.flexAlign()
    }
}

module.exports = wech(formTextareaConfig)