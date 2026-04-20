export function skuStatusFilter(value: string, type = '') {
  const map: any = {
    enable: '已启用',
    disable: '已禁用'
  }
  const colorMap: any = {
    enable: 'success',
    disable: 'danger'
  }
  return type === 'color' ? colorMap[value] : map[value]
}
