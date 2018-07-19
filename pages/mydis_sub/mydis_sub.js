// pages/mydis_sub/mydis_sub.js
import { TuaPage } from '../../wxParse/tua-mp'

let app = getApp()
TuaPage({
  data() {
    return {
      msg: 'msg',
      levers: 100,
      activeIndex: 100,
      datas: [],
      page: 1,
      total_spending: 0,
      morebutton: true,
      defaulthead: app.globalData.config.domain + '/script/usermanage/img/01.jpg' 
    }
  },
  onLoad() {
    var self = this;
    var userInfo = app.globalData.userInfo
    if (userInfo) {
      app.apiRequest('user', 'mydis_fxlist', {
        data: [],
        success: function (res) {
          if (res.data.result == 'OK') {
            self.datas = res.data.data
            self.total_spending = res.data.total_spending
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
    loadmore() {
      let page = parseInt(this.page) + 1
      let levers = this.levers
      let self = this
      app.apiRequest('user', 'mydis_fxlist', {
        data: { page, levers },
        success: function (res) {
          if (res.data.result == 'OK') {
            let olddatas = self.datas
            self.datas = olddatas.concat(res.data.data)
            self.total_spending = res.data.total_spending
            if (res.data.data.length < 20) {
              self.morebutton = false
            }
          }
        }
      })
    },
    changActive(e){
      let self = this
      let levers = e.currentTarget.dataset.id;
      self.activeIndex = levers
      self.page = 1
      self.levers = levers
      self.morebutton = true
      let page = self.page
      app.apiRequest('user', 'mydis_fxlist', {
        data: { page, levers },
        success: function (res) {
          if (res.data.result == 'OK') {
            self.datas = res.data.data
            self.total_spending = res.data.total_spending
            if (res.data.data.length < 20) {
              self.morebutton = false
            }
          }
        }
      })
    }
  },
})