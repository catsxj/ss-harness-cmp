export function healthStatusFilter(value, type) {
  const statusMap = {
    OK: '正常',
    UNKNOWN: '未知',
    DEGRADED_OR_WARNING: '降级/警告',
    MINOR_FAILUR: '错误',
    MAJOR_FAILURE: '错误',
    CRITICAL_FAILURE: '错误',
    NON_RECOVERABLE_ERROR: '错误'
  }
  const colorMap = {
    OK: 'success',
    UNKNOWN: 'disabled',
    DEGRADED_OR_WARNING: 'warning',
    MINOR_FAILUR: 'danger',
    MAJOR_FAILURE: 'danger',
    CRITICAL_FAILURE: 'danger',
    NON_RECOVERABLE_ERROR: 'danger'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}
export function operateStatusFilter(value, type) {
  const statusMap = {
    OK: '在线',
    UNKNOWN: '未知',
    OTHER: '其他',
    DEGRADED: '降级',
    STRESSED: '繁忙',
    PREDICTIVE_ERROR: '失败',
    ERROR: '错误',
    NON_RECOVERABLE_ERROR: '不可恢复',
    STARTING: '启动中',
    STOPPING: '停止中',
    STOPPED: '停止',
    IN_SERVICE: '',
    NO_CONTACT: '无链接',
    LOST_COMMUNICATION: '失去链接',
    ABORTED: '中断',
    DORMANT: '休眠',
    SUPPORTING_ENTITY_IN_ERROR: '错误',
    COMPLETED: '完成',
    POWER_MODE: '电源模式',
    RELOCATING: '迁移中'
  }
  const colorMap = {
    OK: 'success',
    UNKNOWN: 'disabled',
    OTHER: 'primary',
    DEGRADED: 'warning',
    STRESSED: 'warning',
    PREDICTIVE_ERROR: 'danger',
    ERROR: 'danger',
    NON_RECOVERABLE_ERROR: 'danger',
    STARTING: 'warning',
    STOPPING: 'warning',
    STOPPED: 'disabled',
    IN_SERVICE: '',
    NO_CONTACT: 'disabled',
    LOST_COMMUNICATION: 'disabled',
    ABORTED: 'warning',
    DORMANT: 'warning',
    SUPPORTING_ENTITY_IN_ERROR: 'danger',
    COMPLETED: 'success',
    POWER_MODE: 'primary',
    RELOCATING: 'warning'
  }
  return type === 'color' ? colorMap[value] : statusMap[value] || '未连接'
}
