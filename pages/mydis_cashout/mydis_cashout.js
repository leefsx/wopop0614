// pages/mydis_cashout/mydis_cashout.js
import { TuaPage } from '../../wxParse/tua-mp'

let app = getApp()
TuaPage({
  data() {
    return {
      msg: 'msg',
      datas: [],
      apply: {value:0,account:0},
      accounts: [],
      aindex: 0
    }
  },
  conLoad() {},
  onShow() {
    var self = this;
    var userInfo = app.globalData.userInfo
    if (userInfo) {
      app.apiRequest('user', 'mydis_cashout', {
        data: [],
        success: function (res) {
          if (res.data.result == 'OK') {
            self.datas = res.data
            self.apply.value = res.data.minval
            if (res.data.tixian_accounts){
              let account = res.data.tixian_accounts
              let accounts = []
              for (var i in account){
                accounts.push(account[i].account_name + ' ' + account[i].account_info)
              }
              self.accounts = accounts
            }
          }else{
            let err = res.data.errmsg || '请求失败'
            wx.showModal({
              title: err,
              content: '',
              showCancel: false,
              success() { wx.navigateBack() }
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
    applyValue(){
      return this.apply.value
    }
  },
  watch: {
  },
  methods: {
    sliderChange(e) {
      let value = e.detail.value
      this.apply.value = value
    },
    submitApply(e) {
      let formId = e.detail.formId
      let datas = this.datas
      let values = e.detail.value
      if (values['input-value'] > datas.remaining || values['input-value'] < datas.minval){
        wx.showModal({
          title: '提交失败',content: '申请金额错误',showCancel: false
        })
        return false
      }
      let param = {
        'amount': values['input-value'],
        'remark': values['note-value'],
        'pay_account': this.apply.account,
        'formId': formId
      }
      app.apiRequest('user', 'mydis_cashout_save', {
        data: { param },
        success: function (res) {
          if (res.data.result == 'OK') {
            wx.showModal({
              title: '申请成功',content: '', showCancel: false,
              success() {wx.navigateBack()}
            })
          }else {
            let err = res.data.errmsg || '请求失败'
            wx.showModal({
              title: err, content: '', showCancel: false
            })
          }
        }
      })
      return false;
    },
    changeValue(e){
      let value = e.detail.value
      let datas = this.datas
      if (value > datas.remaining) value = datas.remaining
      else if (value < datas.minval) value = datas.minval
      this.apply.value = value
      console.log(this.apply)
    },
    accountsChange(e){
      let value = e.detail.value
      if (value >= 0) {
        let account = this.datas.tixian_accounts[value]
        if (account){
          this.aindex = value
          this.apply.account = account.id
        }
      }
    }
  },
})