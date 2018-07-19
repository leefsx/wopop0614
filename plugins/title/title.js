import wech from '../widget.js';
const titleConfig={
    data: {
        // 组件私有数据
        param: {},
		richtext: '',
    },
    events: {
        // 私有模版事件响应
    },
	methods: {
        formatText (){
			this.setData({
				richtext: this.data.param.message.replace(/ /g, '\xa0'),
			})
        },
    },
	onLoad (){
        this.formatText()
    }
}
/*
const yourConfig = {
    data: {
        // 组件私有数据
        district: '',
    },
    methods: {
        // 组件私有方法
        yourComponentMethod: function () {
            // this指向组件自身（下同）
        },
    },
    events: {
        // 私有模版事件响应
        yourComponentEvent: function () {},
    },
    watch: {
        // 监听组件私有数据的变化（在页面onLoad之后开始监听）
        yourComponentData: function (newValue, oldValue) {},
    },
    onLoad: function () {
        // 先触发页面的生命周期钩子，再触发组件的生命周期钩子
    }
};
*/

module.exports = wech(titleConfig);