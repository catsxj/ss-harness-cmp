import { formatEqParams } from 'utils'
import { getCategoriesByCode, getSkus } from 'services/services/product'
import { conditionServicesList } from 'services/services/catelog'

export default {
  data() {
    return {
      loading: true
    }
  },
  methods: {
    // 初始化sku 通过skus配置去请求所有的数据
    loadSku(row, manual = true) {
      row.elements.forEach((item) => {
        if (item.isLoadData) {
          this.getCategoryList(item, manual)
          this.getServiceItem(item)
        }
      })
    },
    // 获取服务目录
    getServiceItem(item) {
      if (!item.serviceCode) return
      conditionServicesList({
        condition: JSON.stringify({
          condition: 'queryByCode',
          code: item.serviceCode
        })
      }).then((data) => {
        if (data.success) {
          item.serviceItem = data.data
        }
      })
    },
    // 获取商品的sku
    getSku(item) {
      const { categoryId } = item
      this.loading = true
      getSkus(
        formatEqParams({
          categoryId
        })
      )
        .then((data) => {
          if (data.success) {
            this.$set(
              item,
              'skuList',
              data.data.map((item) => {
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
            if (!item.skuId || (item.skuId && !item.skuList.find((item1) => item1.id == item.skuId))) {
              if (item.serviceCode === 'vmware.storage.disk' && item.name === '系统盘') {
                // VC系统盘大小固定100GB
                item.skuId = item.skuList.find((item1) => item1.spec[0].specValue * 1 >= 100)?.id || data.data[0].id
              } else {
                item.skuId = data.data[0].id
              }
              // else if (item.serviceCode === 'cnware.standard.volume' && item.name === '系统盘') {
              //   // CNWARE系统盘大小固定100GB
              //   // 改为用户设置
              //   item.skuId = item.skuList.find(item1 => item1.spec[0].specValue * 1 >= 100)?.id || data.data[0].id
              // }
            }
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 获取服务类型
    getCategoryList(item, manual = true) {
      const { serviceCode } = item
      if (!serviceCode) return console.error('服务类型不能为空, 请检查')
      getCategoriesByCode(serviceCode).then((data) => {
        if (data.success) {
          if (!data.data.length) return
          item.categoryList = data.data
          if (!item.categoryId || manual) item.categoryId = item.categoryList[0].id
          // this.getSku(item)
        }
      })
    }
  }
}
