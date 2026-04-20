export function haModeFilter(value) {
  const map = {
    ACTIVE_ACTIVE: '主动-主动',
    ACTIVE_STANDBY: '主动-备用'
  }
  return map[value]
}
export function failoverModeFilter(value) {
  const map = {
    PREEMPTIVE: '主动',
    NON_PREEMPTIVE: '非主动'
  }
  return map[value]
}
export function disableFirewallFilter(value) {
  if (value) return '启用'
  return '禁用'
}
export function adminStateFilter(value) {
  const statusMap = {
    UP: '开启',
    DOWN: '关闭'
  }
  return statusMap[value] || '开启'
}
export function adminStateIconFilter(value) {
  const iconMap = {
    UP: 'success',
    DOWN: 'danger'
  }
  return iconMap[value] || 'success'
}
export function targetTypeFilter(value) {
  const map = {
    LogicalSwitch: '子网',
    LogicalPort: '逻辑端口',
    LogicalRouter: 'VPC',
    IPAddress: 'IP地址'
  }
  return map[value]
}
export function actionFilter(value) {
  if (value === 'REFLEXIVE') return
  return value
}
