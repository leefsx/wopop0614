// pages/mydis_edit/mydis_edit.js
import { TuaPage } from '../../wxParse/tua-mp'

let app = getApp()
TuaPage({
  data() {
    return {
      msg: 'msg',
      datas: []
    }
  },
  onLoad() {
    var self = this;
    var userInfo = app.globalData.userInfo
    if (userInfo) {
      app.apiRequest('user', 'mydis_edit', {
        data: [],
        success: function (res) {
          if (res.data.result == 'OK') {
            self.datas = res.data
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
    submitEdit(e) {
      let value = e.detail.value
      let err = ''
      if (!value.name) {
        err = '请填写店铺名称'
      } else if (!value.desc) {
        err = '请填写店铺描述'
      }
      let name = value.name
      let desc = value.desc
      app.apiRequest('user', 'mydis_edit_save', {
        data: { name, desc },
        success: function (res) {
          if (res.data.result == 'OK') {
            wx.showModal({
              title: '提交成功', content: '', showCancel: false,
              success() { wx.navigateBack() }
            })
          } else {
            let err = res.data.errmsg || '请求失败'
            wx.showModal({
              title: err, content: '', showCancel: false
            })
          }
        }
      })
    }
  },
})