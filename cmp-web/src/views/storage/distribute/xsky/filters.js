export function statusFilter(value) {
  const map = {
    ACTIVE: '健康',
    INACTIVE: '不健康',
    BUILDING: '创建中'
  }
  return map[value]
}

export function stautsIconFilter(value) {
  const map = {
    ACTIVE: 'success',
    BUILDING: 'normal'
  }
  return map[value] || 'danger'
}
function getSize(value, unit) {
  const unitMap = {
    1: 'B',
    1024: 'KB',
    [1024 * 1024]: 'MB',
    [1024 * 1024 * 1024]: 'GB',
    [1024 * 1024 * 1024 * 1024]: 'TB'
  }
  if (value < 1024 || unit === 1024 * 1024 * 1024 * 1024) return `${value.toFixed(2) / 1} ${unitMap[unit]}`
  return getSize(value / 1024, unit * 1024)
}
// 将字节通过大写转换为b，kb, mb，gb,tb
export function capacityFilter(value, op = {}) {
  const { zeroTrans = true } = op
  if (zeroTrans && Number(value) === 0) return '无限制'
  return getSize(value / 1, 1)
}
export function quotaFilter(value) {
  return Number(value) === 0 ? '无限制' : `${value}个`
}
