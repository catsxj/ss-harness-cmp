import { formatEqParams } from 'utils'
import { getCategoriesByCode, getSkus } from 'services/services/product'

export default {
  data() {
    return {
      loading: true
    }
  },
  created() {
    this.initLoad()
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
            this.$set(
              item,
              'skuList',
              data.data.map(item => {
                const spec = JSON.parse(item.spec)
                return {
                  ...item,
                  spec
                }
              })
            )
            if (!data.data.length) {
              item.skuId = 0
              return this.$message.error('服务类型下不存在产品规格，请检查')
            }
            if (!item.skuId || (item.skuId && !item.skuList.find(item1 => item1.id == item.skuId))) item.skuId = data.data[0].id
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
    // 获取服务类型
    getCategoryList(item) {
      const { serviceCode } = item
      getCategoriesByCode(serviceCode).then(data => {
        if (data.success) {
          if (!data.data.length) return this.$message.error(`服务【${item.name}】不存在产品类型请检查`)
          item.categoryList = data.data
          item.categoryMap = this.getCategoryMap(data.data)
          if (!item.categoryId) item.categoryId = item.categoryList[0].id
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
