// pages/mydis_add_account/mydis_add_account.js
import { TuaPage } from '../../wxParse/tua-mp'

let app = getApp()
TuaPage({
  data() {
    return {
      aindex: 0,
      accounts: ['支付宝', '中国银行', '工商银行', '建设银行', '农业银行', '招商银行', '中国邮政']
    }
  },
  onLoad() {
  },
  computed: {
  },
  watch: {
  },
  methods: {
    submitAccount(e){
      let value = e.detail.value
      let accounts = this.accounts[this.aindex]
      let err = ''
      if (!value.account_no){
        err = '请填写收款帐号'
      } else if (!value.account_info){
        err = '请填写收款人'
      } else if (!accounts){
        err = '请选择收款方式'
      }
      let account_type = parseInt(this.aindex) + 1
      let account_name = accounts
      let param = {
        account_type: account_type,
        account_name: account_name,
        account_no: value.account_no,
        account_info: value.account_info
      }
      app.apiRequest('user', 'mydis_accounts_save', {
        data: { param },
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
    },
    accountsChange(e){
      let value = e.detail.value
      if(value){
        this.aindex = value
      }
    }
  },
})