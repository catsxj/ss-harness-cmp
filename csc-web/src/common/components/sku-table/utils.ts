export function modeUnitFilter(value: string) {
  const map: any = {
    Hour: '小时',
    Month: '月',
    Year: '年'
  }
  return map[value]
}
export function getPrice(sku: any, mode: string) {
  const { spec = [], billPolicy, billable } = sku
  // 不开启计费
  if (!billable) return 0
  const key = `${mode.toLowerCase()}Price`
  // 规格计费
  if (billPolicy !== 'agility') return sku[key]
  const basicPrice = JSON.parse(sku.basicPrice)
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
    totalPrice += item[key] * (countMap[specName] || 1)
  })
  return totalPrice
}
