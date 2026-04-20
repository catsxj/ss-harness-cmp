import { formatEqParams } from 'utils'
import { getCategoriesByCode, getSkus, getPrices } from 'services/services/product'

export default {
  data() {
    return {
      loading: true
    }
  },
  methods: {
    // 初始化sku 通过skus配置去请求所有的数据
    initLoad() {
      this.elements.forEach(item => {
        if (item.isLoadData) {
          this.getCategoryList(item)
        }
      })
    },
    // 计费周期改变，重新计算价格
    resetPrices() {
      this.elements.forEach(item => {
        if (item.isLoadData) {
          this.getPrices(item)
        }
      })
    },
    // 获取商品的sku
    getSku(item) {
      const { categoryId } = item
      this.setNodes(item)
      this.loading = true
      getSkus(
        formatEqParams({
          categoryId
        })
      )
        .then(data => {
          if (data.success) {
            if (!data.data.length) return this.$message.error(`服务【${item.name}】类型下不存在产品，请检查`)
            item.skuList = data.data.map(item => {
              const spec = JSON.parse(item.spec)
              return {
                ...item,
                spec
              }
            })
            if (!item.skuId) {
              item.skuId = data.data[0].id
            }
            this.getPrices(item)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 设置nodes数量
    setNodes(item) {
      const { main, categoryId, categoryMap } = item
      if (!main) return // 不是主sku直接返回
      const { nodes = 1 } = JSON.parse(categoryMap[categoryId].props) || {}
      this.addData.nodes = nodes
    },
    // 获取价格
    async getPrices(item) {
      const { skuId, serviceCode = this.addData.service } = item
      this.loading = true
      const data = await getPrices(
        formatEqParams({
          skuId,
          period: 'Hour'
        })
      )
      this.loading = false
      if (data.success) {
        const list = data.data.rows
        if (!list.length) return this.$message.error('该产品没有设置价格，请检查')
        const { price, discount, amount, id: priceId } = list[0]
        item = Object.assign(item, {
          price,
          discount,
          amount,
          priceId
        })
      }
    },
    // 获取服务类型
    getCategoryList(item) {
      const { serviceCode } = item
      getCategoriesByCode(serviceCode).then(data => {
        if (data.success) {
          if (!data.data.length) return this.$message.error(`服务【${item.name}】不存在产品类型请检查`)
          item.categoryList = data.data
          item.categoryMap = this.getCategoryMap(data.data)
          if (!item.categoryId) {
            item.categoryId = item.categoryList[0].id
          }
          this.getSku(item)
        }
      })
    },
    // 生成服务类型map
    getCategoryMap(data) {
      const map = {}
      data.forEach(item => {
        const { id, name, remark, props } = item
        map[id] = {
          name,
          remark,
          props
        }
      })
      return map
    }
  }
}
