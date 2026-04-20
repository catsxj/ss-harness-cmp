// 小数精度
import { getPrice } from 'components/sku-table/utils'
const decimalPrecision = 5
export default {
  data() {
    return {
      discountType: 'Tenant'
    }
  },
  computed: {
    mode() {
      return this.addData.emption?.duration?.mode || 'Hour'
    },
    discount() {
      return this.$store.state.app.userData.discount
    },
    discountPrice() {
      return (this.price * this.discount).toFixed(decimalPrecision)
    },
    price() {
      let priceTotal = 0
      const amount = this.addData.emption?.duration?.amount || 1 // 目前默认按量计费
      this.showParamList.forEach(param => {
        const {
          emption: { count }
        } = param
        param.elements.forEach(item => {
          if (!item.ignore) {
            const price = this.getSkuPrice(item)
            priceTotal += price * count
          }
        })
      })
      return (priceTotal * amount).toFixed(decimalPrecision)
    }
  },
  methods: {
    // 获取每个规格的具体信息
    getSkuPrice(item) {
      const { serviceItem, skuId, skuList = [], insAmount = 1, otherAmount = 0, elements = [], specs = [] } = item
      if (elements.length) {
        // 该元素下有多个类型
        let priceTotal = 0
        elements.forEach(cell => {
          const price = this.getSkuPrice(cell)
          priceTotal += price
        })
        return priceTotal
      }
      const sku = skuList.find(item => skuId === item.id)

      // 灵活计费,取服务里面的基础定价
      if (!sku) {
        if (!serviceItem?.basicPrice) return 0
        const basicPrice = JSON.parse(serviceItem.basicPrice)
        const modekey = `${this.mode.toLowerCase()}Price`
        const price = specs.reduce((total, cur) => {
          total += Object.keys(cur).reduce((price, key) => {
            price += cur[key] * basicPrice.find(i => i.specName === key)?.[modekey] || 0
            return price
          }, 0)
          return total
        }, 0)
        return price
      }

      const price = getPrice(sku, this.mode)
      // 集群部署多个实例
      const { nodes = 1 } = this.addData
      // 实例数量/计数单位向上取整
      const count = Math.ceil(insAmount + otherAmount / 1)
      const finallPrice = Number((price * count * nodes).toFixed(decimalPrecision))
      return finallPrice
    }
  }
}
