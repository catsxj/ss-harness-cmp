import { getServiceDetail } from 'services/services/spec'
export default {
  methods: {
    // 获取规格
    getSpec(item) {
      const { skuId, skuList } = item
      const sku = skuList.find(cell => skuId === cell.id)
      return sku.spec.map(item => {
        return {
          [item.specName]: item.specValue
        }
      })
    },
    // 对elements进行处理
    getSkuParams(data) {
      const params = []
      data.forEach(item => {
        // 忽略此elements
        if (item.ignore) return
        const { serviceCode, skuId, priceId, insAmount, elements, categoryId, categoryMap, main, ignore } = item
        // 如果存在子节点对子节点进行处理
        if (elements) {
          const returnData = this.getSkuParams(elements)
          params.push(...returnData)
          return
        }
        const result = {
          serviceCode,
          skuId,
          priceId,
          category: categoryMap[categoryId].remark,
          main,
          ignore
        }
        let specs = []
        switch (serviceCode) {
          case 'vmware.storage.disk':
          case 'manageone.standard.volume':
          case 'openstack.standard.volume':
            specs = [{ disk: insAmount }]
            break
          default:
            specs = this.getSpec(item)
        }
        result.specs = specs
        params.push(result)
      })
      return params
    },
    getApplyData() {
      if (this.getParams) {
        const config = this.getParams()
        // 校验不通过
        if (!config) return false
        const { configs } = this.addData
        this.addData.configs = {
          ...configs,
          ...config
        }
      }
      const { location, configs, service } = this.addData
      if (configs.osTenantName) {
        configs.extension = {
          osTenantName: configs.osTenantName
        }
      }
      const elements = this.getSkuParams(this.elements)
      return {
        location,
        configs,
        elements,
        service
      }
    }
  }
}
