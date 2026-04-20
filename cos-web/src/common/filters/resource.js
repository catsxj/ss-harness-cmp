export function vmStatusFilter(status) {
  const statusMap = {
    RUNNING: '运行中',
    STOPPED: '关机',
    STOPPING: '关机中',
    STARTING: '开机中',
    SUSPENDED: '挂起',
    SUSPENDING: '挂起中',
    ACTIVING: '激活中',
    PAUSED: '停止',
    PAUSING: '停止中',
    RECOVERING: '恢复中',
    BUILDING: '创建中',
    RESTARTING: '重启中',
    EXCEPTION: '异常',
    SYNSEXCEPTION: '同步异常',
    UNKNOWN: '已断开',
    UNKNOWNON: '已断开',
    UNKNOWNOFF: '已断开',
    UNKNOWNSUSPEND: '已断开'
  }
  return statusMap[status] || '未知'
}
// 云主机状态
export function openstackServer(status) {
  const statusMap = {
    DANGER: '严重告警',
    WARN: '告警',
    RUNNING: '运行中',
    STOPPED: '已关机',
    STOPPING: '关机中',
    STARTING: '开机中',
    SUSPENDED: '挂起',
    SUSPENDING: '挂起中',
    ACTIVING: '激活中',
    ACTIVE: '运行中',
    PAUSED: '停止',
    PAUSING: '停止中',
    RECOVERING: '恢复中',
    BUILDING: '创建中',
    RESTARTING: '重启中',
    EXCEPTION: '异常',
    SYNSEXCEPTION: '同步异常',
    SOFTRESTARTING: '软重启中',
    UNKNOWN: '已断开',
    UNKNOWNON: '已断开',
    UNKNOWNOFF: '已断开',
    UNKNOWNSUSPEND: '已断开',
    RESIZING: '修改配置中',
    RESIZINGTCE: '修改配置中',
    RESIZINGAWS: '修改配置中',
    VERIFYRESIZE: '配置修改中',
    SHELVED: '强制搁置',
    RESTORING: '快照恢复中',
    AVAILABLE: '可用',
    INAVAILABLE: '不可用',
    IN_USE: '正在使用',
    'IN-USE': '正在使用',
    ENABLED: '启用',
    DELETING: '删除中',
    DOWNLOADING: '下载中',
    green: '正常',
    red: '异常',
    yellow: '告警',
    gray: '不可用',
    INSTALLING: '安装中',
    UNINSTALL: '未安装',
    FAILED: '安装失败',
    inactive: '非活动',
    PENDING_CREATE: '等待创建',
    PENDING_UPDATE: '等待更新',
    PENDING_DELETE: '等待删除',
    UPLOADING: '上传镜像中',
    INACCESSIBLE: '不可访问',
    SYSTEMRESIZING: '重装系统中',
    SHUTDOWN: '待回收',
    TORECYCLE: '待回收',
    ERROR: '错误',
    DEALLOCATE: '已停止',
    PENDING: '创建中',
    DISABLED: '未启用',
    DEALLOCATEING: '停止中',
    PROTECTING: '正在创建',
    shutoff: '关闭'
  }
  return statusMap[status] || '未知'
}

export function action(value) {
  const obj = {
    DENY: '拒绝',
    ALLOW: '允许'
  }
  return obj[value]
}

export function image(value) {
  const obj = {
    BUILDING: '创建中',
    QUEUED: '排队中',
    ACTIVE: '正常',
    DELETED: '删除中',
    ERROR: '错误',
    CREATE_TIMEOUT: '请求超时需手动同步'
  }
  return obj[value]
}

export function volume(value) {
  const obj = {
    creating: '创建中',
    available: '可用',
    reserved: '预定',
    attaching: '正在附加',
    detaching: '正在拆离',
    'in-use': '正在使用',
    maintenance: '锁定',
    deleting: '删除中',
    'awating-transfer': '等待转换',
    error: '创建失败',
    error_deleting: '删除失败',
    'backing-up': '正在备份',
    'restoring-backup': '正在还原',
    'error_backing-up': '备份失败',
    error_restoring: '还原失败',
    error_extending: '扩展失败',
    downloading: '正在下载',
    uploading: '正在上传',
    retyping: '正在更改卷类型',
    extending: '正在扩展'
  }
  return obj[value]
}

// 云主机状态颜色
export function vmStatusColor(status) {
  const statusMap = {
    DEALLOCATE: 'danger',
    DANGER: 'danger',
    INACCESSIBLE: 'danger',
    WARN: 'warning',
    RUNNING: 'success',
    STOPPED: 'danger',
    STOPPING: 'warning',
    SOFTRESTARTING: 'warning',
    STARTING: 'warning',
    SUSPENDED: 'danger',
    SUSPENDING: 'warning',
    ACTIVING: 'warning',
    ACTIVE: 'success',
    PAUSED: 'danger',
    PAUSING: 'warning',
    RECOVERING: 'warning',
    BUILDING: 'warning',
    RESTARTING: 'warning',
    EXCEPTION: 'danger',
    SYNSEXCEPTION: 'danger',
    UNKNOWN: 'disabled',
    UNKNOWNON: 'disabled',
    UNKNOWNOFF: 'disabled',
    UNKNOWNSUSPEND: 'disabled',
    RESIZING: 'warning',
    RESIZINGTCE: 'warning',
    RESIZINGAWS: 'warning',
    VERIFYRESIZE: 'warning',
    SHELVED: 'danger',
    RESTORING: 'warning',
    AVAILABLE: 'normal',
    INAVAILABLE: 'danger',
    IN_USE: 'success',
    'IN-USE': 'success',
    DELETING: 'warning',
    DOWNLOADING: 'warning',
    green: 'success',
    red: 'danger',
    yellow: 'danger',
    gray: 'danger',
    ENABLED: 'success',
    INSTALLING: 'warning',
    UNINSTALL: 'danger',
    FAILED: 'danger',
    inactive: 'danger',
    PENDING_CREATE: 'warning',
    UPLOADING: 'warning',
    PENDING_UPDATE: 'warning',
    PENDING_DELETE: 'warning',
    SYSTEMRESIZING: 'warning',
    SHUTDOWN: 'warning',
    TORECYCLE: 'warning',
    RESERVED: 'warning',
    ERROR: 'danger',
    PENDING: 'warning',
    DISABLED: 'danger',
    DEALLOCATEING: 'warning',
    PROTECTING: 'warning',
    DOWN: 'info',
    shutoff: 'danger'
  }
  return statusMap[status] || 'danger'
}

export function forUse(value, type) {
  const statusMap = {
    UNUSED: '未用',
    CANDIDATE: '候选',
    SPARE: '备件',
    FAILED: '错误',
    MEMBER: '成员'
  }
  return statusMap[value]
}

export function database(value) {
  const obj = {
    DANGER: '严重告警',
    WARN: '告警',
    RUNNING: '运行中',
    STOPPED: '已停止',
    STOPPING: '关机中',
    STARTING: '开机中',
    SUSPENDED: '挂起',
    SUSPENDING: '挂起中',
    ACTIVING: '激活中',
    ACTIVE: '运行中',
    PAUSED: '停止',
    PAUSING: '停止中',
    RECOVERING: '恢复中',
    BUILDING: '创建中',
    RESTARTING: '重启中',
    EXCEPTION: '不健康',
    SYNSEXCEPTION: '同步异常',
    SOFTRESTARTING: '软重启中',
    UNKNOWN: '已断开',
    UNKNOWNON: '已断开',
    UNKNOWNOFF: '已断开',
    UNKNOWNSUSPEND: '已断开',
    RESIZING: '修改配置中',
    SHELVED: '强制搁置',
    RESTORING: '快照恢复中',
    AVAILABLE: '可用',
    INAVAILABLE: '不可用',
    IN_USE: '正在使用',
    'IN-USE': '正在使用',
    ENABLED: '启用',
    DELETING: '删除中',
    DOWNLOADING: '下载中',
    green: '正常',
    red: '异常',
    yellow: '告警',
    gray: '不可用',
    INSTALLING: '安装中',
    UNINSTALL: '未安装',
    FAILED: '安装失败',
    inactive: '非活动',
    PENDING_CREATE: '等待创建',
    PENDING_UPDATE: '等待更新',
    PENDING_DELETE: '等待删除',
    UPLOADING: '上传镜像中',
    INACCESSIBLE: '不可访问',
    SYSTEMRESIZING: '重装系统中',
    SHUTDOWN: '待回收',
    TORECYCLE: '待回收',
    DOWN: '待使用'
  }
  return obj[value] || '未知'
}

export function rolePoolType(value) {
  const obj = {
    data: '数据池',
    index: '对象索引池'
  }
  return obj[value]
}

export function syncStatus(value) {
  const statusMap = {
    0: '已同步',
    1: '已同步',
    '-1': '未同步'
  }
  return statusMap[value]
}

export function deviceType(value) {
  const obj = {
    Hybrid: '混合盘'
  }
  return obj[value] || value
}

export function periodFilter(value) {
  const obj = {
    MINUTE: '分钟',
    HOUR: '小时',
    DAY: '天',
    MONTH: '月',
    YEAR: '年',
    Year: '年',
    Month: '月',
    Day: '日',
    Hour: '小时'
  }
  return obj[value]
}
