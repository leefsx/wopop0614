var comm = require('../../wxParse/common.js');
const App = getApp()
Page({
    data: {
        address: {},
        prompt: {
            hidden: !0,
            icon: '../../../image/iconfont-addr-empty.png',
            title: '还没有收货地址呢',
            text: '暂时没有相关数据',
        },
        items:[],
        areaname: [],
        fr: ''
    },
    onLoad(opt) {
      var that = this
      if (opt && opt.fr == 'chose'){
        that.setData({
          fr: 'chose'
        })
      }
      that.onShow()

      
        // this.onPullDownRefresh()
    },
    onShow(){
      var that = this
      wx.setStorage({
        key: 'address',
        data: ''
      })
      App.apiRequest('user', 'getarea',{
        data: {},
        success: function (res) {
          if (res.data.addresses.length > 0) {
            that.setData({
              items: res.data.addresses,
              areaname: res.data.areaname,
              'prompt.hidden': true
            })
          } else {
            that.setData({
              'prompt.hidden': false,
            })
          }
        }
      })
    },
    // initData() {
    //     this.setData({
    //         address: {
    //             items: [],
    //             params: {
    //                 page : 1,
    //                 limit: 10,
    //             },
    //             paginate: {}
    //         }
    //     })
    // },
    toAddressEdit(e) {
        wx.navigateTo({
            url:'../address/address?id='+e.currentTarget.dataset.id
        })
    },
    toAddressAdd(e) {
        console.log(e)
        wx.navigateTo({
            url:'../address/address'
        })
    },
    cancelAddress(e) {
      var id = e.currentTarget.dataset.id
      var that = this
      if (id){
        wx.showModal({
          title: '温馨提示：',
          content: '是否确认取消该订单',
          success: function (res) {
            if (res.confirm) {
              App.apiRequest('user', 'del_consignee',{
                data: { id: id },
                success: function (res) {
                  if (res.data.result == 'OK') {
                    wx.showToast({
                      title: '删除成功'
                    })
                    that.onLoad()
                  } else {
                    wx.showToast({
                      title: '删除失败'
                    })
                  }

                }
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
              // 不做任何操作
            }
          }
        })
      }
    },
    setDefalutAddress(e) {
        const id = e.currentTarget.dataset.id
        var that = this
        if(id){
          App.apiRequest('user', 'setDefaultAddress',{
            data: {id:id},
            success: function(res){
              that.onLoad()

            }
          })
        }

    },
    getList() {
        const address = this.data.address
        const params = address.params

        // App.HttpService.getAddressList(params)
        this.address.queryAsync(params)
        .then(data => {
            console.log(data)
            if (data.meta.code == 0) {
                address.items = [...address.items, ...data.data.items]
                address.paginate = data.data.paginate
                address.params.page = data.data.paginate.next
                address.params.limit = data.data.paginate.perPage
                this.setData({
                    address: address,
                    'prompt.hidden': address.items.length,
                })
            }
        })
    },
    choseAddress(e){
      var index = e.currentTarget.dataset.index;
      var areaname = this.data.areaname
      var items = this.data.items
      var adress = items[index]
      adress.detail = areaname[adress['prov_id']] + areaname[adress['city_id']] + areaname[adress['dist_id']] + adress['detailed_addr']

      var fr = this.data.fr
      if(fr = 'chose'){
        wx.setStorage({
          key: 'address',
          data: items[index],
          success() {
            wx.navigateBack();
          }
        })
      }else{
        return false
      }

    },
    onPullDownRefresh() {
         //this.initData()
      this.onShow()
      wx.stopPullDownRefresh()
    }
    // onReachBottom() {
    //     if (!this.data.address.paginate.hasNext) return
    //     this.getList()
    // },
})