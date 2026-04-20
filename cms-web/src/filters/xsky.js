export function deviceTypeFilter(value) {
  const obj = {
    Hybrid: '混合盘'
  }
  return obj[value] || value
}
export function xskyHostTypeFilter(value) {
  const statusMap = {
    storage_server: '存储服务器',
    storage_client: '网关服务器'
  }
  return statusMap[value]
}
export function roleDiskTypeFilter(value) {
  const obj = {
    data: '数据盘',
    HDD: '混合盘'
  }
  return obj[value] || '未知'
}
export function rolePoolTypeFilter(value) {
  const obj = {
    data: '数据池',
    index: '对象索引池'
  }
  return obj[value]
}
export function priorityFilter(value) {
  const obj = {
    0: '默认',
    1: '优先'
  }
  return obj[value]
}
export function qosEnabledFilter(value) {
  const obj = {
    true: '开启',
    false: '未开启'
  }
  return obj[value]
}
export function xskyStatusFilter(value, type) {
  const statusMap = {
    ACTIVE: '健康',
    RUNNING: '健康',
    ERROR: '错误'
  }
  const colorMap = {
    ACTIVE: 'success',
    ERROR: 'danger'
  }
  return type == 'color' ? colorMap[value] || 'normal' : statusMap[value] || '未知'
}
