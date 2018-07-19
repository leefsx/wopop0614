// pages/mydis_record/mydis_record.js
import { TuaPage } from '../../wxParse/tua-mp'

let app = getApp()
TuaPage({
  data() {
    return {
      msg: 'msg',
      datas: [],
      dealinfos: [],
      page: 1,
      morebutton: true
    }
  },
  onLoad() {
    var self = this;
    var userInfo = app.globalData.userInfo
    let page = this.page
    if (userInfo) {
      app.apiRequest('user', 'cashout_list', {
        data: [],
        success: function (res) {
          if (res.data.result == 'OK') {
            self.datas = res.data.data
            self.dealinfos = res.data.dealinfos
            if (res.data.data.length < 20) {
              self.morebutton = false
            }
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
  },
  watch: {
  },
  methods: {
    loadmore(){
      let page = parseInt(this.page) + 1
      let self = this
      app.apiRequest('user', 'cashout_list', {
        data: { page },
        success: function (res) {
          if (res.data.result == 'OK') {
            let olddatas = self.datas
            self.datas = olddatas.concat(res.data.data)
            if (res.data.data.length<20){
              self.morebutton = false
            }
          }
        }
      })
    }
  },
})