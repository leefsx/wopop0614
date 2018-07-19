var comm = require('../../wxParse/common.js');
var config = require('../../static/config.js');
var app = getApp()
Page({
  data: {
    foods:[],               // 购物车列表
    hasList:false,          // 列表是否有数据
    totalPrice:0,           // 总价，初始为0
    selectAllStatus:'',    // 全选状态，默认全选
    jsStatus: false,
    totleNum: 0,
    insidepage_themecolor: '#c71f3b',
    prompt: {
      hidden: false,
      icon: '../../../image/asset-img/iconfont-cart-empty.png',
      title: '购物车空空如也',
      text: '来挑几件好货吧',
      buttons: [
        {
          text: '随便逛',
          bindtap: 'bindtap',
        },
      ],
    },
    pageid: 'shopping_cart/shopping_cart'
  },
  bindtap(){
    wx.switchTab({
      url: '../category/category',
    })
  },
  onShow() {
    var openid = wx.getStorageSync('openid');
    if (app.globalData.carts && app.globalData.carts.length){
      for (let cart of app.globalData.carts){
        if (cart.min_purchase_num && cart.num < cart.min_purchase_num){
          cart.num = cart.min_purchase_num;
        }
      }
    }
    this.setData({
      foods: app.globalData.carts,
      insidepage_themecolor: config.insidepage_themecolor
    })
    this.getSkuName();
    if (app.globalData.carts.length){
      var cart_num = app.globalData.carts.length
      if (cart_num > 0) {
        this.setData({
          'prompt.hidden': app.globalData.carts.length
        });
        this.isSelectAll();
        this.getTotalPrice();
      }
      
    }else{
      this.setData({
        'prompt.hidden': false
      });
    }
    let curpage = this.data.pageid;
    let tabs = getApp().globalData.config.tabBar || {};
    if (tabs.list) {
      this.setData({ tabs });
      let _has_ = tabs.list.findIndex((c) => {
        return c.pagePath == curpage
      });
      this.setData({
        showBar: _has_ > -1 ? true : false
      })
    }
    wx.hideLoading()
  },
  getSkuName(){
    var foods=this.data.foods;
    var skuids=[]
    if(foods && foods.length>0){
      for(let f of foods){
        var skuid=f.skuid;
        if (skuid>0){
          skuids.push(skuid);
        }
      }
    }
    
    if(skuids.length){
      var that=this;
      app.apiRequest('product_detail', 'getCartSkuName', {
        data: {skuids:skuids.join(',')},
        success(res) {
          let resdata = res.data.data || []
          if (res.data.result == 'OK') {
            for(let i=0;i<foods.length;i++){
              let foodskuid=foods[i].skuid;
              if(foodskuid){
                let skuname=resdata[foodskuid];
                if(skuname){
                  var data={}
                  data['foods['+i+'].skuchecked']=skuname;
                  that.setData(data);
                }
              }
            }
          } 
        }
  
      })
    }
    
  },
  toConfirm() {
    var cartItems = this.data.foods
    var selectItems = []
    cartItems.forEach((item)=>{
      if(item.selected){
        selectItems.push(item)
      }
    })
    app.globalData.selectCarts = selectItems
    if (!selectItems || selectItems.length === 0) {
      wx.hideToast()
      wx.showModal({
        title: '未选购商品',
        content: '您需要将商品加入购物车后才能支付',
        showCancel: false,
        success: function (res) { }
      })
      return
    }
    wx.showLoading({
      title: '请求中',
      mask: true
    })
    comm.get_cuser({
      success: function (cuser) {
        var that = this
        if (cuser == false) {
          wx.showToast({
            title: '请先登录'
          })
          wx.navigateTo({
            url: '../login/login'
          })
        } else {
          app.apiRequest('order', 'addcart',{
            data: { data: JSON.stringify(selectItems),fr: 'cart' },
            success: function (res) {
              if (res.data.result == 'OK') {
                wx.navigateTo({
                  url: '../order_confirm/order_confirm?fr=cart'
                })
              } else if (res.data.errmsg == '2') {
                wx.navigateTo({
                  url: '../login/login',
                })

              } else {
                wx.hideLoading()
                wx.showToast({
                  title: '请求失败'
                })
              }
            }
          })
        }
      }
    })
      
    
    
    
      
    
    
  },
  /**
   * 当前商品选中事件
   */
  selectList(e) {
    const index = e.currentTarget.dataset.index;
    let foods = this.data.foods;
    const selected = foods[index].selected;
    foods[index].selected = !selected;
    app.globalData.carts = foods
    this.setData({
      foods: foods
    });
    this.isSelectAll();
    this.getTotalPrice();
  },

  /**
   * 删除购物车当前商品
   */
  deleteList(e) {
    const index = e.currentTarget.dataset.index;
    let foods = this.data.foods;
    let that = this
    wx.showModal({
      title: '温馨提示：',
      content: '是否确认删除该商品',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          foods.splice(index, 1);
          that.setData({
            foods: foods
          });
          app.globalData.carts = foods
          wx.showToast({
            title: '删除成功'
          })
          if (!foods.length) {
            that.setData({
              hasList: false,
              'prompt.hidden': false
            });
          } else {
            that.isSelectAll();
            that.getTotalPrice();
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 购物车全选事件
   */
  selectAll(e) {
    let selectAllStatus = this.data.selectAllStatus;
    selectAllStatus = !selectAllStatus;
    let foods = this.data.foods;

    for (let i = 0; i < foods.length; i++) {
      foods[i].selected = selectAllStatus;
    }
    app.globalData.carts = foods
    this.setData({
      selectAllStatus: selectAllStatus,
      foods: foods
    });
    this.getTotalPrice();
  },

  /**
   * 绑定加数量事件
   */
  addCount(e) {
    const index = e.currentTarget.dataset.index;
    let foods = this.data.foods;
    let num = foods[index].num;
    let max_kc = foods[index].max_kc;
    let max_num = foods[index].max_purchase_num || 0;

    num = num + 1;
    if (max_num > 0 && num > max_num) {
      num = max_num;
      wx.showToast({
        title: '超出最大购买量~'
      })
    }
    if (num > max_kc) {
      num = max_kc
      wx.showToast({
        title: '数量超出范围~'
      })
    }
    if (!num || num < 1) num = 1;
    foods[index].num = num;
    this.setData({
      foods: foods
    });
    app.globalData.carts = foods
    this.getTotalPrice();
  },

  /**
   * 绑定减数量事件
   */
  minusCount(e) {
    const index = e.currentTarget.dataset.index;
    let foods = this.data.foods;
    let num = foods[index].num;
    let min_num = foods[index].min_purchase_num;
    if(num <= 1){
      return false;
    }
    num = num - 1;
    if (min_num > 0 && num < min_num) {
      num = min_num;
      wx.showToast({
        title: '最小购买量:' + min_num
      })
    }
    if (!num || num < 1) num = 1;
    foods[index].num = num;
    this.setData({
      foods: foods
    });
    app.globalData.carts = foods
    this.getTotalPrice();
  },
  bindManual(e) {
    const index = e.currentTarget.dataset.index;
    let foods = this.data.foods;
    let num = parseInt(e.detail.value);
    let max_kc = foods[index].max_kc;
    let max_num = foods[index].max_purchase_num || 0;
    let min_num = foods[index].min_purchase_num;
    if (isNaN(num)) {
      if (min_num > 0) {
        num = min_num;
      } else {
        num = 1;
      }
    }
    if (min_num > 0 && num < min_num) {
      num = min_num;
      wx.showToast({
        title: '最小购买量:' + min_num
      })
    }
    if (max_num > 0 && num > max_num) {
      num = max_num;
      wx.showToast({
        title: '超出最大购买量~'
      })
    }
    if (num > max_kc) {
      num = max_kc
      wx.showToast({
        title: '数量超出范围~'
      })
    }
    if (!num || num < 1) num = 1;
    foods[index].num = num;
    this.setData({
      foods: foods
    })
    app.globalData.carts = foods
    this.getTotalPrice();
  },
/**
   * 判断全选状态
   */
  isSelectAll(){
    let selectAllStatus = this.data.selectAllStatus;
    let foods = this.data.foods;

    for (let i = 0; i < foods.length; i++) {
      if (!foods[i].selected){
        selectAllStatus = false;
        break
      }
      selectAllStatus = true;
    }
    this.setData({
      selectAllStatus: selectAllStatus,
    });
  },


  /**
   * 计算总价
   */
  getTotalPrice() {
    let foods = this.data.foods;                  // 获取购物车列表
    let totalPri = 0;
    let totleNum = 0;
    let jsStatus = this.data.jsStatus;
    for(let i = 0; i<foods.length; i++) {         // 循环列表得到每个数据
      if(foods[i].selected) {                     // 判断选中才会计算价格
        totalPri += foods[i].num * foods[i].price;   // 所有价格加起来
        totleNum += foods[i].num;
      }
    }
    if (totalPri > 0){
      jsStatus = true;
    }else{
      jsStatus = false;
    }
    this.setData({
      totleNum: totleNum,
      jsStatus: jsStatus,                                // 最后赋值到data中渲染到页面
      foods: foods,
      totalPrice: totalPri.toFixed(2)
    });
  },
  onPullDownRefresh: function () {
    this.onShow()
    wx.stopPullDownRefresh()
  },
  switchTab: function (e) {
    let url = e.currentTarget.dataset.url;
    getApp().turnToPage(url, true)
  }

})