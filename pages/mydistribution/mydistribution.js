// pages/mydistribution/mydistribution.js
import { TuaPage } from '../../wxParse/tua-mp'

let app = getApp()
TuaPage({
  data() {
    return {
      msg: 'msg',
      datas: [],
      canIUseAvatarUrl: wx.canIUse('open-data.type.userAvatarUrl'),
    }
  },
  onLoad() {
    var self = this;
    var userInfo = app.globalData.userInfo
    if (userInfo) {
      app.apiRequest('user', 'mydistribution', {
        data: [],
        success: function (res) {
          if (res.data.result == 'OK') {
            self.datas = res.data
          }else{
            let err = res.data.errmsg || '请求失败'
            wx.showModal({
              title: err,
              content: '',
              showCancel:false,
              success(){wx.navigateBack()}
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },
  computed: {
    money(){
      if(this.datas){
        let money = this.datas['remaining'] - this.datas['totalmoney']
        if (money <= 0) money = '0.00'
        return money
      }
      
    }
  },
  watch: {
  },
  methods: {
  },
})