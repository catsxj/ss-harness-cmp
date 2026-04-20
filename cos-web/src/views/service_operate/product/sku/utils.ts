// 生成展示规格
export function generateSpec(item: any) {
  const { serviceCode, spec: sourceSpec } = item
  // 运维边【排类不需要展示规格
  if (serviceCode.includes('operations') || serviceCode.includes('fabric')) {
    return ''
  }
  const spec = JSON.parse(sourceSpec)
  const specName: string[] = []
  spec.forEach((cell: any) => {
    if (cell.specValue === true) {
      // 复选框
      specName.push(cell.specName)
    } else if (cell.specValue) {
      specName.push(`${cell.specValue}${cell.unit || ''}`)
    }
  })
  return specName.join('/')
}
export function getPrice(type: string, serviceItem: any, sku: any) {
  const { spec } = sku
  if (serviceItem.billPolicy !== 'agility') return sku[type]
  const basicPrice = JSON.parse(serviceItem.basicPrice)
  // 没有specName说明没有规格设置
  const flag = spec.every((item: any) => !item.specName || item.specValue)
  // 无值直接返回
  if (!flag) return '/'
  // 获取数值map
  const countMap: any = {}
  spec.forEach((item: any) => {
    countMap[item.specName] = item.specValue
  })
  let totalPrice = 0
  basicPrice.forEach((item: any) => {
    const { specName } = item
    totalPrice += item[type] * (countMap[specName] || 1)
  })
  return totalPrice
}
