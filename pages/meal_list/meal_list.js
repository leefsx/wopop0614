let app = getApp()
Page({
  data: {
      meals:[],
      meal:[],//当前选择产品
      categorys:[],
      shop_id: 0,
      carts: [],
      specs: [],//规格wx
      ingredients: [],//配料
      taste: [],//口味
      selspec: [],//已选规格
      selingred: [],//已选加料
      seltaste: [],//已选口味
      cartsLength: 0,
      cartsprice: 0,
      selectMenuid: 0,
      shop:{name:''},
      total: { count: 0, money: 0 }, //用来放多少个商品和共多少钱
      windowHeight: "", //屏幕高度
      flag: true, //加号
      showModalStatus: false, // 购物车详情弹出窗口,
      styles: {},
      text: {}
  },
  onLoad(options) {
    let shop_id = options.shop_id
    var that = this;
    that.parseStyle()
    // 页面初始化 options为页面跳转所带来的参数
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    })

    //-------------------------------------------------------

    let param = {}
    if (shop_id) param.shop_id = shop_id
    that.data.shop_id = shop_id
    that.getMeals(param)
    //--------------------------------------------------------
  },
  handletouchmove(){
    this.setData({ flag: true})
  },
  getMeals(e){
    let that = this
    let shop_id = e.shop_id ? e.shop_id : that.data.shop_id
    let cate_id = e.cate_id ? e.cate_id : 0
    let param = {}
    if (shop_id) param.shop_id = shop_id
    if (cate_id) param.cate_id = cate_id
    app.apiRequest('meal', 'meal_list', {
      data: param ,
      success: function (res) {
        if (res.data.result == 'OK') {
          let meals = res.data.data
          let categorys = res.data.categorys
          if (!cate_id&&categorys.length>0) {
            cate_id = categorys[0].id
          }
          let selectMenuid = cate_id
          let carts = that.data.carts
          let cateMeals = [];
          for(let t in meals){
            if (meals[t].category_id == selectMenuid){
              cateMeals.push(meals[t])
            }
          }
          meals = cateMeals;
          for (let i in meals){
            for(let j in carts){
              if (parseInt(meals[i].id) == parseInt(carts[j].id)) {
                meals[i].count = carts[j].count
              }
            }
          }
          if (!that.data.shop.name && res.data.shop.name){
            that.setData({ shop: res.data.shop})
            wx.setNavigationBarTitle({
              title: res.data.shop.name
            })
          }
          that.setData({ meals: meals, selectMenuid: cate_id, categorys: categorys})
        }else {
          let err = res.data.errmsg || '请求失败'
          wx.showModal({
            title: err, content: '', showCancel: false
          })
        }
      }
    })
  },
  //选择规格
  tapAttr(e){
    let data = e.currentTarget.dataset
    let meal = this.data.meal
    let total = this.data.total
    let index = data.index
    if (data.type == 'spec') {
      let selspec = this.data.selspec
      let oldprice = this.parsePrice(selspec.price)
      let price = this.parsePrice(meal.spec[index].price)
      
      total.money = this.parsePrice(total.money - oldprice + price )
      selspec = meal.spec[index]
      this.setData({
        selspec, total
      })
    } else if (data.type == 'ingred') {
      let oldprice = 0
      let selingred = []
      // for (let i in meal.ingred){
      //   if (meal.ingred[i].sel) oldprice += this.parsePrice(meal.ingred[i].price)
      // }
      if (!meal.ingred[index].sel){
        meal.ingred[index].sel = true
        total.money = this.parsePrice(total.money) + this.parsePrice(meal.ingred[index].price)
      } else {
        meal.ingred[index].sel = false
        total.money = this.parsePrice(total.money) - this.parsePrice(meal.ingred[index].price)
      }
      for (let i in meal.ingred) {
        if (meal.ingred[i].sel) selingred.push(meal.ingred[i])
      }
      total.money = this.parsePrice(total.money)
      //total.money += price
      this.setData({
        selingred, total, meal
      })
    } else if (data.type == 'taste'){
      let name = data.name
      let index = data.index
      let tindex = data.tindex
      let seltaste = this.data.seltaste
      meal.taste[index].sel = name
      // if (taste.sel){
      //   for (let i in seltaste) {
      //     if (seltaste[i] == name) {
      //       seltaste.splice(i, 1)
      //       break;
      //     }
      //   }
      // }else{
      //   meal.taste[tindex].sel = true
      //   seltaste.push(name)
      // }
      this.setData({ seltaste, meal })
    }
  },
  parsePrice(val) {
    var floatval = parseFloat(val);
    floatval += 0.0000001;
    if (floatval) {
      var theval = parseFloat(floatval.toFixed(2));
      return theval;
    } else return 0;
  },
    // --------------------购物车详情
    showModal: function () {
      // 显示遮罩层
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation
      animation.translateY(300).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: true
      })
      setTimeout(function () {
        animation.translateY(0).step()
        this.setData({
          animationData: animation.export()
        })
      }.bind(this), 200)
    },
    //隐藏对话框
    hideModal: function () {
      // 隐藏遮罩层
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
      this.data.animation = animation
      animation.translateY(300).step()
      this.setData({
        animationData: animation.export(),
      })
      setTimeout(function () {
        animation.translateY(0).step()
        this.setData({
          animationData: animation.export(),
          showModalStatus: false
        })
      }.bind(this), 200)
    },
    // ---------------------------购物车详情结束
    // 获取左侧选中时的id
    selectMenu(e){
      let data = e.currentTarget.dataset
      var that = this
      that.getMeals({ cate_id: data.id })
      that.data.selectMenuid = data.id
    },
    //加数量
    addCount: function (event) {
      let that = this
      let data = event.currentTarget.dataset
      let index = data.index
      let type = data.type
      let meals = this.data.meals
      let carts = this.data.carts
      let meal = []
      if (meals[index]){
        meal = meals[index]
      }
      if (type == 'cart'){
        meal = carts[index]
        for (let i in meals) {
          if (meals[i].id == meal.id) meals[i].count += 1
        }
        carts[index].count += 1
        this.setData({
          meals: meals,
          carts: carts
        })
        this.dealCart();
        return false;
      } else {
        if (meal.price_type == '0' && !meal.taste_ids && !meal.ingredients){
          if (meals[index].count) meals[index].count += 1
          else meals[index].count = 1
        }
      }
      
      this.setData({
        meals: meals,
        meal: meal,
        carts: carts
      })
      let total = this.data.total
      total.money = 0
      let specs = []
      if (meal.price_type=='0' && !meal.ingredients && !meal.taste_ids) {
        this.addCart()
        this.dealCart()
      }else{
        if (meal.price_type == '1') specs = meal.spec
        else{
          total.money = meal.discount_price > 0 ? meal.discount_price : meal.price
        }
        this.setData({ flag: false, specs: specs, selspec: [], selingred: [], seltaste: [], total: total})
      }

      this.animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'linear',
        delay: 100,
        transformOrigin: '50% 50%',
        opacity: "1"
      })
    },
    //计算购物车数量、总价
    dealCart(){
      let carts = this.data.carts
      let meal = this.data.meal
      let meals = this.data.meals
      let nocart = true
      let cartsLength = 0
      let cartsprice = 0
      for (let i in carts) {
        if (carts[i].id){
          let count = carts[i].count ? parseInt(carts[i].count) : 1
          cartsLength += count
          let price = this.parsePrice(carts[i].discount_price > 0 ? carts[i].discount_price : carts[i].price) + this.parsePrice(carts[i].packing_fee)
          price = price*count
          if (carts[i].ingred_id) {
            //加料计算
            for(let k in carts[i].ingred_id){
              price += this.parsePrice(carts[i].ingred_id[k].price) * count
            }
          }
          cartsprice += price
        }
      }
      if (carts.length == 0){
        for(let i in meals){
          if (meals[i].count > 0) meals[i].count = 0
        }
      }
      this.setData({
        cartsLength: cartsLength, 
        cartsprice: this.parsePrice(cartsprice),
        meals: meals
      })
    },
    submit(){
      let mealCarts = this.data.carts
      if (mealCarts.length<=0){
        wx.showModal({
          title: '购物车不能为空',
          content: '',
          showCancel: false
        })
        return false;
      }
      for (let i in mealCarts){
        if (mealCarts[i].spec) mealCarts[i].spec = ''
        if (mealCarts[i].ingred) mealCarts[i].ingred = ''
        if (mealCarts[i].taste) mealCarts[i].taste = ''
      }
      let cartsprice = this.data.cartsprice
      app.globalData.mealCarts = mealCarts
      let shop_id = this.data.shop_id
      let showModalStatus = false
      this.setData({ showModalStatus })
      wx.navigateTo({
        url: '../meal_order/meal_order?cartsprice=' + cartsprice + '&shop_id=' + shop_id,
      })
    },
    //加入购物车
    addCart() {
      let meal = this.data.meal
      let carts = this.data.carts
      let meals = this.data.meals
      //无规格产品加入购物车
      if (meal.price_type == '0' && !meal.ingredients && !meal.taste_ids){
        let incart = false
        for (let i in carts) {
          if (carts[i].id == meal.id){
            carts[i].count += 1
            incart = true
          }
        }
        if (!incart){
          if (!meal.count) meal.count = 1
          carts.push(meal)
        }
      }else{
        let mealspec = ''
        let mealingred = []
        let mealtaste = []
        if (this.data.selspec) mealspec = this.data.selspec.id
        if (this.data.selingred){
          let selingred = this.data.selingred
          for (let i in selingred){
            if (selingred[i].id) {
              mealingred.push(selingred[i].id)
            }
          }
          if (mealingred) mealingred = mealingred.sort().join('');
        }
        if (meal.taste){
          let taste = meal.taste
          for (let i in taste){
            if (taste[i].sel) mealtaste.push(taste[i].sel)
          }
          if (mealtaste) mealtaste = mealtaste.sort().join('');
        }
        if(this.data.carts){
          let carts = this.data.carts
          let cartspec = ''
          let cartingredstr = ''
          let carttastestr = ''
          for(let i in carts){
            if(carts[i].id==meal.id){
              let cartingred = []
              let carttaste = []
              if (carts[i].spec_id) cartspec = carts[i].spec_id.id
              if (carts[i].ingred_id) {
                let ingred_id = carts[i].ingred_id
                for (let i in ingred_id) {
                  if (ingred_id[i].id) {
                    cartingred.push(ingred_id[i].id)
                  }
                }
                if (cartingred) cartingredstr = cartingred.sort().join('')
              }
              if (carts[i].taste_id){
                let taste_id = carts[i].taste_id
                for (let i in taste_id){
                  if (taste_id[i].sel) {
                    carttaste.push(taste_id[i].sel)
                  }
                }
                if (carttaste) carttastestr = carttaste.sort().join('')
              }
              if (!mealspec) mealspec = ''
              if (!mealingred) mealingred = ''
              if (!mealtaste) mealtaste = ''
              if (!cartspec) cartspec = ''
              if (!cartingredstr) cartingredstr = ''
              if (!carttastestr) carttastestr = ''
              if (mealspec == cartspec && mealingred == cartingredstr && mealtaste == carttastestr){
                carts[i].count += 1
                let meal_id = carts[i].id
                for (let i in meals) {
                  if (meals[i].id == meal_id) meals[i].count += 1
                }
                this.setData({ carts: carts, flag: true, meals: meals })
                this.dealCart()
                return false;
              }
            } else continue;
          }
        }

        //有规格产品加入购物车
        if (meal.price_type == '1'){
          let selspec = this.data.selspec
          if (selspec.id) {
            meal.count = 1
            meal.price = selspec.price
            meal.spec_id = { id: selspec.id, name: selspec.name, price: selspec.price }
          }else{
            wx.showModal({
              title: '请选择规格',
              content: '',
              showCancel: false
            })
            return false;
          }
        }
        if (meal.ingredients){
          let selingred = this.data.selingred
          meal.ingred_id = selingred
          meal.count = 1
        }
        if (meal.taste_ids){
          let seltaste = []
          let taste = meal.taste
          for (let i in taste){
            if(taste[i].sel){
              seltaste.push({ name: taste[i].name, sel: taste[i].sel})
            }
          }
          meal.taste_id = seltaste
          if (!meal.count) meal.count = 1
        }
        for (let i in meals) {
          if (meals[i].id == meal.id){
            if (meals[i].count) meals[i].count += 1
            else meals[i].count = 1
            break;
          }
        }
        carts.push(meal)
        this.setData({
          meal: meal,
          flag: true,
          carts: carts,
          meals: meals
        })
        this.dealCart()
      }
      this.setData({carts})
      
    },
    //减数量
    minusCount: function (event) {
      let data = event.currentTarget.dataset
      let index = data.index
      let type = data.type
      let meals = this.data.meals
      let meal = []
      if (meals[index]) {
        meal = meals[index]
      }
      if (type == 'cart') meal = this.data.carts[index]
      // 这个弹出框只能针对有规格商品的删减提示，不能点减号删减只能在购物车中删减
      if (meal.price_type == '1' && type!='cart'){
        wx.showModal({
          title: '提示',
          content: '含有规格的商品只能在购物车里删减',
          showCancel: false
        })
      } else {
        let carts = this.data.carts
        if (type=='cart'){
          for (let i in meals){
            if (meals[i].id == meal.id) meals[i].count -= 1
          }
        }else{
          if (meals[index].count) meals[index].count -= 1
        }
        
        for (let i in carts) {
          let product = carts[i]
          if (carts[i].id == meal.id) {
            if (carts[i].count > 1) {
              carts[i].count -= 1
            } else {
              carts.splice(i, 1)
            }
            break;
          }
        }
        this.setData({ meals, carts })
        this.dealCart()
      }
    },
    onShow(){
      let carts = app.globalData.mealCarts || []
      if (!carts.length) {
        let total = this.data.total
        let meals = this.data.meals
        let cartsLength = 0
        let cartsprice = 0
        for (let i in meals){
          if (meals[i].count > 0) meals[i].count = 0
        }
        this.setData({ carts, cartsLength, cartsprice, meals })
      }
    },
    //清空购物车
    truncateCarts(){
      let meals = this.data.meals
      let showModalStatus = false
      let cartsLength = 0
      let cartsprice = 0
      let carts = []
      for(let i in meals){
        meals[i].count = 0
      }
      this.setData({ meals, showModalStatus, cartsLength, cartsprice, carts })
    },
    parseStyle() {
      let config = app.globalData.config.wxmeal_inner_gstyle;
      let text = this.data.text;
      if (config) {
      ['category_actived','background', 'border_btm', 'title', 'desc', 'price', 'thumb', 'boxer_space', 'minusplus', 'minusplus_icon', 'carticon_bg', 'shopping_cart','buy'].forEach((c) => {
        let nodestyle = "";
        let tmpobj = config[c] || {};
        for (let ky in tmpobj) {
          let val = tmpobj[ky];
          if (ky == 'text') { text[c] = val; continue; }
          if (typeof val == 'number')
            val = getApp().px2rpx(val);
          
          nodestyle += ky + ": " + val + ";";
        }
        if (nodestyle.length > 0) {
          let oldobj = this.data.styles;
          oldobj[c] = nodestyle;
          this.setData({ styles: oldobj })
        }
      })
      this.setData({ display: config.display, text: text})
      }
    }
})

