// 小数精度
const decimalPrecision = 2

export default {
  data() {
    return {
      discountType: 'Tenant'
    }
  },
  created() {},
  computed: {
    unit() {
      const {
        emption: {
          duration: { mode }
        },
        unit
      } = this.addData
      // 存在unit时自定义单位
      if (unit) {
        const [{ amount }] = this.elements
        return mode === 'Hour' ? unit : `${amount}${unit}`
      }
      return mode === 'Hour' ? '小时' : '月'
    },
    discount() {
      return this.$store.state.app.userData.discount
    },
    price: {
      get() {
        let priceTotal = 0
        let productPriceTotal = 0
        let tenantPriceTotal = 0
        this.elements.forEach(item => {
          const { discount = 1 } = item
          const { price, discountPrice } = this.getSkuPrice(item)
          productPriceTotal += discountPrice
          tenantPriceTotal += price * this.discount
          priceTotal += price
        })
        this.getTotalPrice(productPriceTotal, tenantPriceTotal)
        return priceTotal.toFixed(decimalPrecision)
      },
      set() {}
    }
  },
  methods: {
    getTotalPrice(productPriceTotal, tenantPriceTotal) {
      let price = tenantPriceTotal
      // 商品与租户折扣哪个优惠用哪个
      if (productPriceTotal <= tenantPriceTotal) {
        price = productPriceTotal
        this.discountType = 'Product'
      } else {
        this.discountType = 'Tenant'
      }
      const {
        emption: { count }
      } = this.addData
      this.totalPrice = (price * count).toFixed(decimalPrecision)
    },
    // 获取每个规格的具体信息
    getSkuPrice(item) {
      const { amount = 1, price = 0, discount = 1, insAmount = 1, otherAmount = 0, elements } = item
      if (elements && elements.length) {
        // 该元素下有多个类型
        let priceTotal = 0
        let discountPriceTotal = 0
        elements.forEach(cell => {
          const { price, discountPrice } = this.getSkuPrice(cell)
          priceTotal += price
          discountPriceTotal += discountPrice
        })
        return {
          price: priceTotal,
          discountPrice: discountPriceTotal
        }
      }
      // 集群部署多个实例
      const { nodes } = this.addData
      // 没有价格没必要进行下面的计算逻辑
      if (!price) {
        return {
          price: 0,
          discountPrice: 0
        }
      }
      // 实例数量/计数单位向上取整
      const count = Math.ceil((insAmount + otherAmount / 1) / amount)
      const finallPrice = Number((price * count * nodes).toFixed(decimalPrecision))
      return {
        price: finallPrice,
        discountPrice: finallPrice * discount
      }
    }
  }
}
