// 小数精度
import { getPrice } from 'components/sku-table/utils'
const decimalPrecision = 2
export default {
  data() {
    return {
      discountType: 'Tenant'
    }
  },
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
    discountPrice() {
      return (this.price * this.discount).toFixed(decimalPrecision)
    },
    price() {
      let priceTotal = 0
      const {
        emption: {
          count,
          duration: { amount = 1 }
        },
        service
      } = this.addData
      this.elements.forEach(item => {
        const price = this.getSkuPrice(item)
        priceTotal += price
      })
      return (priceTotal * amount * count).toFixed(decimalPrecision)
    }
  },
  methods: {
    // 获取每个规格的具体信息
    getSkuPrice(item) {
      const { service, serviceItem } = this.addData
      const { skuId, skuList = [], insAmount = 1, otherAmount = 0, elements, serviceCode, basic } = item
      if (elements) {
        // 该元素下有多个类型
        let priceTotal = 0
        elements.forEach(cell => {
          const price = this.getSkuPrice(cell)
          priceTotal += price
        })
        return priceTotal
      }
      let sku = skuList.find(item => skuId === item.id)
      if (!sku && skuList.length) {
        const basicPrice = JSON.parse(skuList[0].basicPrice)
        sku = {
          ...basicPrice[0],
          billPolicy: 'spec',
          billable: true
        }
      }
      // 没有sku并且不是运维和编排服务，直接返回0
      if (!sku && !service.includes('fabric') && !service.includes('operations')) return 0
      const {
        emption: {
          duration: { mode }
        }
      } = this.addData
      // 代码容错处理
      if (!sku && !serviceItem) return 0
      if (['cloudtower.standard.volume', 'cnware.standard.volume'].includes(serviceCode) && item.name === '系统盘') {
        // cloudtower/cnware 系统盘根据基础定价来计算
        const basicPrice = JSON.parse(skuList[0]?.basicPrice || '[]')
        if (insAmount === 1) return 0
        return basicPrice[0].monthPrice * insAmount
      }
      const price = getPrice(sku || serviceItem, mode)
      // 集群部署多个实例
      const { nodes = 1 } = this.addData
      // 实例数量/计数单位向上取整
      const count = Math.ceil(insAmount + otherAmount / 1)
      const finallPrice = Number((price * count * nodes).toFixed(decimalPrecision))
      return finallPrice
    }
  }
}
