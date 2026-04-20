// 云主机状态颜色
export function openstackServerColor(status) {
  const statusMap = {
    DANGER: 'danger',
    INACCESSIBLE: 'danger',
    WARN: 'warning',
    RUNNING: 'success',
    Running: 'success',
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
    SHELVED: 'danger',
    RESTORING: 'warning',
    AVAILABLE: 'normal',
    INAVAILABLE: 'danger',
    IN_USE: 'success',
    'IN-USE': 'success',
    InUse: 'success',
    DELETING: 'warning',
    DOWNLOADING: 'warning',
    green: 'normal',
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
    PROTECTING: 'warning',
    creating: 'info',
    resuming: 'warning',
    ready: 'success',
    deleting: 'danger'
  }
  return statusMap[status] || 'danger'
}
// 腾讯镜像状态
export function tcImageStatus(status) {
  const statusMap = {
    CREATING: '创建中',
    NORMAL: '正常',
    ACTIVE: '正常',
    SYNCING: '复制中'
  }
  return statusMap[status]
}
// 腾讯镜像颜色
export function tcImageColor(status) {
  const colorMap = {
    CREATING: 'warning',
    NORMAL: 'success',
    ACTIVE: 'success',
    SYNCING: 'warning'
  }
  return colorMap[status]
}

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
// dell存储
export function dellFilter(status) {
  const statusMap = {
    UNKNOWN: '未知',
    OTHER: '其他',
    OK: '在线',
    DEGRADED: '降级',
    STRESSED: '繁忙',
    PREDICTIVE_ERROR: '失败',
    ERROR: '错误',
    NON_RECOVERABLE_ERROR: '不可恢复',
    STARTING: '启动中',
    STOPPING: '停止中',
    STOPPED: '已停止',
    IN_SERVICE: '维护中',
    NO_CONTACT: '无会话',
    LOST_COMMUNICATION: '失去链接',
    ABORTED: '中断',
    DORMANT: '休眠',
    SUPPORTING_ENTITY_IN_ERROR: '错误',
    COMPLETED: '完成',
    POWER_MODE: '电源模式',
    RELOCATING: '迁移中'
  }
  return statusMap[status] || ''
}
export function dellFilter2(status) {
  const statusMap = {
    UNKNOWN: '未知',
    OTHER: '其他',
    OK: '接通',
    DEGRADED: '降级',
    STRESSED: '繁忙',
    PREDICTIVE_ERROR: '失败',
    ERROR: '错误',
    NON_RECOVERABLE_ERROR: '不可恢复',
    STARTING: '启动中',
    STOPPING: '停止中',
    STOPPED: '已停止',
    IN_SERVICE: '维护中',
    NO_CONTACT: '无会话',
    LOST_COMMUNICATION: '失去链接',
    ABORTED: '中断',
    DORMANT: '未映射',
    SUPPORTING_ENTITY_IN_ERROR: '错误',
    COMPLETED: '完成',
    POWER_MODE: '电源模式',
    RELOCATING: '迁移中'
  }
  return statusMap[status] || ''
}
export function dellFilterColor(status) {
  const statusMap = {
    OK: 'success'
  }
  return statusMap[status] || 'danger'
}

export function platformStatusFilter(status) {
  const statusMap = {
    NORMAL: '连接正常',
    ABNORMAL: '连接异常',
    DANGER: '严重警告',
    WARN: '警告'
  }
  return statusMap[status]
}

export function fiberOpticalWeb(status) {
  const statusMap = {
    IN_USE: '使用中',
    AVAILABLE: '未使用',
    RESERVED: '保留',
    initiator: '发起方',
    'initiator-target': '发起方-目标',
    'initiator-vfc': '发起方-虚拟光纤通道'
  }
  return statusMap[status] || '待挂载'
}

export function powerVolumeFilter(status) {
  const statusMap = {
    creating: '创建中',
    available: '可用',
    reserved: '预定',
    attaching: '正在附加',
    detaching: '正在拆离',
    'in-use': '正在使用',
    maintenance: '锁定',
    deleting: '删除中',
    'awaiting-transfer': '等待转换',
    error: '错误',
    error_deleting: '删除失败',
    'backing-up': '正在备份',
    'restoring-backup': '正在还原',
    'error_backing-up': '备份失败',
    error_restoring: '还原失败',
    error_extending: '扩展失败',
    downloading: '正在下载',
    uploading: '正在上传',
    retyping: '正在更改卷类型',
    extending: '正在扩展',
    toCreate: '待创建'
  }
  return statusMap[status]
}

export function powerVolumeFilterColor(status) {
  const statusMap = {
    creating: 'warning',
    available: 'success',
    reserved: 'normal',
    attaching: 'warning',
    detaching: 'warning',
    'in-use': 'warning',
    maintenance: 'normal',
    deleting: 'warning',
    'awaiting-transfer': 'warning',
    error: 'danger',
    error_deleting: 'danger',
    'backing-up': 'warning',
    'restoring-backup': 'warning',
    'error_backing-up': 'danger',
    error_restoring: 'danger',
    error_extending: 'danger',
    downloading: 'warning',
    uploading: 'warning',
    retyping: 'warning',
    extending: 'warning',
    toCreate: 'warning'
  }
  return statusMap[status]
}

// 云主机状态
export function openstackServer(status) {
  const statusMap = {
    DANGER: '严重告警',
    WARN: '告警',
    RUNNING: '运行中',
    Running: '可用',
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
    InUse: '运行中',
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
    DOWN: '待使用',
    GENERAL: '通用化',
    SOFTSTOPPING: '软关机中',
    NORMAL: '可用',
    ABNORMAL: '不可用',
    CREATING: '创建中',
    EXPANDING: '恢复中',
    READONLY: '只读',
    HIBERNATED: '休眠',
    creating: '创建中',
    resuming: '恢复云主机中',
    ready: '创建成功',
    deleting: '删除中',
    UPDATING: '更新中'
  }
  return statusMap[status] || '未知'
}

export function powerServer(status) {
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
    ERROR: '错误',
    SYNSEXCEPTION: '同步异常',
    SOFTRESTARTING: '软重启中',
    UNKNOWN: '已断开',
    UNKNOWNON: '已断开',
    UNKNOWNOFF: '已断开',
    UNKNOWNSUSPEND: '已断开',
    RESIZING: '正在调整大小',
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
    TORECYCLE: '待回收'
  }
  return statusMap[status] || '未知'
}

export function firewallStatus(value) {
  const obj = {
    RUNNING: '运行中',
    INACTIVE: '未激活',
    CREATED: '已创建',
    STOPPED: '停止',
    BUILDING: '创建中',
    ERROR: '错误',
    EXCEPTION: '失效',
    PENDING_CREATE: '等待创建',
    PENDING_UPDATE: '等待更新',
    PENDING_DELETE: '等待删除',
    ACTIVE: '运行中'
  }
  return obj[value]
}
export function powerFloatIp(value) {
  const obj = {
    BUILDING: '创建中',
    RUNNING: '正常'
  }
  return obj[value] || '异常'
}

export function ipv6Enabled(value) {
  const obj = {
    true: '已启动',
    false: '未启动'
  }
  return obj[value] || ' '
}

export function powerJoin(value) {
  const obj = {
    OK: '正常',
    WARNING: '警告',
    CRITICAL: '紧急',
    PENDING: '暂挂',
    UNKNOWN: '未知',
    ATTENTION: '注意'
  }
  return obj[value] || '异常'
}

export function powerJoinColor(value) {
  const obj = {
    OK: 'success',
    WARNING: 'warning',
    CRITICAL: 'danger',
    PENDING: 'danger',
    UNKNOWN: 'danger',
    ATTENTION: 'warning'
  }
  return obj[value] || 'danger'
}

export function powerDescription(value) {
  const obj = {
    pass: '正常',
    fail: '失败',
    warning: '警告'
  }
  return obj[value] || '异常'
}
export function powerDescriptionColor(value) {
  const obj = {
    pass: 'success',
    fail: 'danger',
    warning: 'warning'
  }
  return obj[value] || 'danger'
}

export function powerProvider(value) {
  const obj = {
    running: '正在运行',
    error: '错误'
  }
  return obj[value] || '异常'
}
export function powerProviderColor(value) {
  const obj = {
    running: 'success',
    error: 'danger'
  }
  return obj[value] || 'danger'
}

export function powerMapping(value) {
  const obj = {
    queued: '正在排队',
    saving: '正在保存',
    active: '活动',
    killed: '上传失败',
    deleted: '已删除',
    pending_delete: '已删除',
    deactivated: '不活动',
    uploading: '正在上传',
    importing: '正在导入'
  }
  return obj[value] || '异常'
}

export function powerVmTaskStatus(value) {
  const obj = {
    image_pending_upload: '正在捕获',
    deleting: '正在删除',
    resized: '正在调整大小',
    'powering-off': '正在断电',
    'powering-on': '正在通电',
    rebooting: '正在重新启动',
    rebooting_hard: '正在重新启动',
    attaching_volume: '正在连接卷'
  }
  return obj[value] || ''
}

export function powerMappingColor(value) {
  const obj = {
    queued: 'warning',
    saving: 'warning',
    active: 'normal',
    killed: 'error',
    deleted: 'error',
    pending_delete: 'error',
    deactivated: 'error',
    uploading: 'warning',
    importing: 'warning'
  }
  return obj[value] || 'error'
}

export function firewallColor(value) {
  const obj = {
    RUNNING: 'success',
    INACTIVE: 'warning',
    CREATED: 'normal',
    STOPPED: 'danger',
    BUILDING: 'warning',
    ERROR: 'danger',
    EXCEPTION: 'warning',
    PENDING_CREATE: 'warning',
    PENDING_UPDATE: 'warning',
    PENDING_DELETE: 'warning',
    ACTIVE: 'success'
  }
  return obj[value]
}

export function tcFloatIp(value) {
  const obj = {
    UNBIND: '未绑定',
    BIND: '已绑定',
    AVAILABLE: '可用'
  }
  return obj[value]
}

export function tcFloatIpColor(value) {
  const obj = {
    UNBIND: 'normal',
    BIND: 'success',
    AVAILABLE: 'success'
  }
  return obj[value]
}

export function action(value) {
  const obj = {
    DENY: '拒绝',
    ALLOW: '允许'
  }
  return obj[value]
}

export function grouoRuleAction(value) {
  const obj = {
    DROP: '拒绝',
    ACCEPT: '接收'
  }
  return obj[value]
}

export function snapshot(value) {
  const obj = {
    AVAILABLE: '正常',
    BUILDING: '创建中',
    DELETING: '删除中',
    EXCEPTION: '异常',
    NORMAL: '正常',
    CREATE_TIMEOUT: '请求超时需手动同步',
    accomplished: '正常',
    available: '正常',
    RESTORING: '恢复中'
  }
  return obj[value] || '未知'
}

export function snapshotColor(value) {
  const obj = {
    AVAILABLE: 'success',
    BUILDING: 'warning',
    DELETING: 'warning',
    RESTORING: 'warning',
    EXCEPTION: 'danger',
    NORMAL: 'success',
    CREATE_TIMEOUT: 'danger',
    accomplished: 'success',
    available: 'success'
  }
  return obj[value] || 'danger'
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

export function imageColor(value) {
  const obj = {
    QUEUED: 'warning',
    ACTIVE: 'success',
    DELETED: 'danger',
    CREATE_TIMEOUT: 'danger'
  }
  return obj[value] || 'normal'
}

export function powervcImage(value) {
  const obj = {
    queued: '正在排队',
    saving: '正在保存',
    active: '活动',
    killed: '上传失败',
    deleted: '已删除',
    pending_delete: '已删除',
    deactivated: '不活动',
    uploading: '正在上传',
    importing: '正在导入'
  }
  return obj[value]
}

export function powervcImageColor(value) {
  const obj = {
    queued: 'warning',
    saving: 'warning',
    active: 'normal',
    killed: 'danger',
    deleted: 'primary',
    pending_delete: 'primary',
    deactivated: 'primary',
    uploading: 'warning',
    importing: 'warning'
  }
  return obj[value] || 'normal'
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

export function redundancyFilter(value) {
  const obj = {
    Enabled: '地域冗余',
    Disabled: '本地冗余'
  }
  return obj[value] || value
}

export function volumeColor(value) {
  const obj = {
    creating: 'warning',
    available: 'normal',
    reserved: 'normal',
    attaching: 'warning',
    detaching: 'warning',
    'in-use': 'success',
    maintenance: 'success',
    deleting: 'danger',
    'awating-transfer': 'warning',
    error: 'danger',
    error_deleting: 'danger',
    'backing-up': 'warning',
    'restoring-backup': 'warning',
    'error_backing-up': 'danger',
    error_restoring: 'danger',
    error_extending: 'danger',
    downloading: 'warning',
    uploading: 'warning',
    retyping: 'warning',
    extending: 'warning'
  }
  return obj[value] || 'normal'
}

export function balancerFilter(value) {
  const obj = {
    APP_COOKIE: 'App Cookie',
    HTTP_COOKIE: 'Http Cookie',
    SOURCE_IP: '源IP'
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
    Running: 'success',
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
    InUse: 'success',
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
    GENERAL: 'info',
    SOFTSTOPPING: 'warning',
    NORMAL: 'normal',
    ABNORMAL: 'danger',
    CREATING: 'normal',
    EXPANDING: 'warning',
    READONLY: 'normal',
    HIBERNATED: 'warning',
    UPDATING: 'warning'
  }
  return statusMap[status] || 'danger'
}

export function systemDiskType(value) {
  const obj = {
    Standard_LRS: '标准 HDD',
    Premium_LRS: '高级 SSD',
    StandardSSD_LRS: '标准 SSD'
  }
  return obj[value]
}

export function azureRegion(status) {
  const statusMap = {
    chinaeast: '中国东部',
    chinanorth: '中国北部',
    chinanorth2: '中国北部2',
    chinaeast2: '中国东部2'
  }
  return statusMap[status]
}

export function infrastructFilter(value, type) {
  const statusMap = {
    NORMAL: '正常',
    ALARM: '告警',
    ABNORMAL: '异常',
    DANGER: '异常',
    DISABLED: '不可用'
  }
  const colorMap = {
    DISABLED: 'danger',
    ALARM: 'warning',
    NORMAL: 'success',
    ABNORMAL: 'danger',
    DANGER: 'danger'
  }
  return type == 'color' ? colorMap[value] : statusMap[value]
}

export function securityGroupFilter(value) {
  const obj = {
    ingress: '入口',
    egress: '出口'
  }
  return obj[value]
}

export function secruityProtocol(value) {
  const obj = {
    TCP: 'TCP',
    ICMP: 'ICMP',
    UDP: 'UDP',
    null: '任何'
  }
  return obj[value] || value
}

export function vmMaintain(value) {
  const obj = {
    true: '维护模式',
    false: '正常模式'
  }
  return obj[value]
}

export function vmNetworkType(value) {
  const obj = {
    DVSWITCH: '分布式交换机',
    VSWITCH: '标准交换机'
  }
  return obj[value]
}
export function networkType(value) {
  const obj = {
    Distributed: '分布式',
    Centralized: '集中式'
  }
  return obj[value]
}
export function vmConnect(value) {
  const obj = {
    true: '已连接',
    false: '未连接'
  }
  return obj[value]
}

export function openstackNetworkStatus(value) {
  const obj = {
    RUNNING: '运行中',
    INACTIVE: '未激活',
    CREATED: '已创建',
    STOPPED: '停止',
    BUILDING: '创建中',
    ERROR: '错误',
    EXCEPTION: '异常',
    PENDING_CREATE: '等待创建',
    PENDING_UPDATE: '等待更新',
    PENDING_DELETE: '等待删除',
    DOWN: '未绑定',
    ACTIVE: '已绑定'
  }
  return obj[value]
}

export function stack(value, type) {
  const obj = {
    SUSPEND_COMPLETE: '挂起完成',
    RESUME_COMPLETE: '恢复完成',
    CREATE_COMPLETE: '创建完成',
    UPDATE_COMPLETE: '更新完成',
    DELETE_FAILED: '删除失败',
    CHECK_COMPLETE: '检查完成',
    BUILDING: '创建中',
    RUNNING: '运行中',
    CREATE_IN_PROGRESS: '创建中',
    DELETE_IN_PROGRESS: '删除中',
    UPDATE_IN_PROGRESS: '更新中',
    CREATE_FAILED: '创建失败',
    UPDATE_FAILED: '更新失败',
    CHECK_FAILED: '检查失败',
    SUSPEND_FAILED: '挂起失败',
    RESUME_FAILED: '恢复失败'
  }
  return obj[value] || '未知'
}

export function mysqlStatus(value) {
  const obj = {
    Succeeded: '可用',
    Ready: '可用',
    Disabled: '禁用',
    Dropping: '停止',
    Inaccessible: '无法访问',
    Restarting: '重启中',
    BUILDING: '创建中',
    Scaling: '正在缩放中'
  }
  return obj[value]
}
export function mysqlStatusColor(value) {
  const obj = {
    Succeeded: 'success',
    Ready: 'success',
    Disabled: 'danger',
    Dropping: 'danger',
    Inaccessible: 'danger',
    Restarting: 'warning',
    BUILDING: 'warning',
    Scaling: 'warning'
  }
  return obj[value]
}
export function publicAccess(value) {
  const obj = {
    BLOB: 'Blob',
    CONTAINER: '容器',
    OFF: '专用',
    UNKNOWN: '未知'
  }
  return obj[value]
}

export function leaseState(value) {
  const obj = {
    UNSPECIFIED: '未审查',
    AVAILABLE: '可用',
    LEASED: '租赁',
    EXPIRED: '已过期',
    BREAKING: '粉碎中',
    BROKEN: '已粉碎',
    BUILDING: '正在创建',
    UNLOCKED: '已解锁',
    LOCKED: '已锁定'
  }
  return obj[value]
}
export function blobFilter(value) {
  const obj = {
    UNKNOWN: '未知',
    HOT: '热（推断）',
    COOL: '冷',
    ARCHIVE: '存档',
    UNSPECIFIED: '未审查',
    BLOCK_BLOB: '块 blob',
    PAGE_BLOB: '页 blob',
    APPEND_BLOB: '附加 blob'
  }
  return obj[value]
}

export function stackColor(value, type) {
  const obj = {
    SUSPEND_COMPLETE: 'success',
    RESUME_COMPLETE: 'success',
    CREATE_COMPLETE: 'success',
    UPDATE_COMPLETE: 'success',
    DELETE_FAILED: 'danger',
    CHECK_COMPLETE: 'success',
    BUILDING: 'warning',
    RUNNING: 'success',
    CREATE_IN_PROGRESS: 'warning',
    DELETE_IN_PROGRESS: 'warning',
    UPDATE_IN_PROGRESS: 'warning',
    CREATE_FAILED: 'danger',
    UPDATE_FAILED: 'danger',
    CHECK_FAILED: 'danger',
    SUSPEND_FAILED: 'danger',
    RESUME_FAILED: 'danger'
  }
  return obj[value] || 'danger'
}

// 云主机镜像状态
export function vmImageStatus(value, type) {
  const statusMap = {
    QUEUED: '排队中',
    DELETED: '已删除',
    ACTIVE: '运行中'
  }
  const colorMap = {
    QUEUED: 'normal',
    DELETED: 'danger',
    ACTIVE: 'success'
  }
  return type == 'color' ? colorMap[value] : statusMap[value]
}

// 存储OSD状态
export function storageStatus(value, type) {
  const statusMap = {
    down: '停止',
    up: '运行中',
    RUNNING: '运行中',
    STOPPED: '关机'
  }
  const colorMap = {
    down: 'danger',
    up: 'success',
    RUNNING: 'success',
    STOPPED: 'danger'
  }
  return type == 'color' ? colorMap[value] : statusMap[value]
}

// ceph集群状态
export function cephStatus(value) {
  const obj = {
    NORMAL: '正常',
    HEALTH_WARN: '警告',
    HEALTH_ERR: '异常'
  }
  return obj[value]
}

// ceph集群状态
export function nodeType(value) {
  const obj = {
    mon: '控制',
    osd: '存储',
    mds: '元数据'
  }
  return obj[value]
}

// VPC专用网络状态
export function vpcStatus(value, type) {
  const obj = {
    Available: {
      name: '可用',
      color: 'success'
    }
  }
  return obj[value] && obj[value][type]
}

export function F5Status(value, type) {
  const obj = {
    available: {
      name: 'Avaliable',
      color: 'success'
    },
    unavailable: {
      name: 'Unavailable',
      color: 'warning'
    },
    offline: {
      name: 'Offline',
      color: 'danger'
    },
    unknown: {
      name: 'Unknown',
      color: 'disabled'
    }
  }
  return obj[value] && obj[value][type]
}

export function shareType(value) {
  const obj = {
    share: '共享',
    exclusive: '独占'
  }
  return obj[value]
}

export function resourceGroup(status) {
  const statusMap = {
    PHYSICAL: '物理主机',
    LOGICAL: '虚拟主机'
  }
  return statusMap[status]
}

export function poolStatus(value, type) {
  const statusMap = {
    ONLINE: '联机',
    OFFLINE: '脱机',
    DEGRADED: '降级',
    FORMATTING: '格式化',
    EXCLUDED: '排除',
    PENDING: '等待',
    ADDING: '正在增加',
    DELETING: '正在删除',
    FLUSHING: '正在清洗'
  }
  const colorMap = {
    ONLINE: 'success',
    OFFLINE: 'danger',
    DEGRADED: 'warning',
    FORMATTING: 'normal',
    EXCLUDED: 'warning',
    PENDING: 'normal',
    ADDING: 'warning',
    DELETING: 'warning',
    FLUSHING: 'warning'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}
export function flashcopyStatus(value, type) {
  const statusMap = {
    INITIALIZED: '已初始化',
    PREPARE_IN_PROGRESS: '正在准备',
    PREPARED: '已准备',
    RESYNC_IN_PROGRESS: '正在拷贝',
    SYNCHRONIZED: '已拷贝',
    QUIESCE_IN_PROGRESS: '正在停止',
    QUIESCED: '已停止',
    IDLE: '空闲',
    Initialized: '已初始化',
    PrepareInProgress: '正在准备',
    Prepared: '已准备',
    ResyncInProgress: '正在拷贝',
    Idle: '空闲或已拷贝',
    Broken: '损坏',
    Empty: '空',
    Stopped: '已停止',
    Stopping: '正在停止'
  }
  const colorMap = {
    INITIALIZED: 'primary',
    PREPARE_IN_PROGRESS: 'warning',
    PREPARED: 'normal',
    RESYNC_IN_PROGRESS: 'warning',
    SYNCHRONIZED: 'success',
    QUIESCE_IN_PROGRESS: 'warning',
    QUIESCED: 'danger',
    IDLE: 'normal',
    Initialized: 'primary',
    PrepareInProgress: 'warning',
    Prepared: 'normal',
    ResyncInProgress: 'warning',
    Idle: 'normal',
    Broken: 'danger',
    Empty: 'normal',
    Stopped: 'danger',
    Stopping: 'warning'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}
export function flashcopyColor(value, type) {
  const colorMap = {
    INITIALIZED: '#5d59b4',
    PREPARE_IN_PROGRESS: '#ff9900',
    PREPARED: '#2e8cf0',
    RESYNC_IN_PROGRESS: '#ff9900',
    SYNCHRONIZED: '#54c54e',
    QUIESCE_IN_PROGRESS: '#ff9900',
    QUIESCED: '#dc1a1a',
    IDLE: '#2e8cf0',
    Initialized: '#5d59b4',
    PrepareInProgress: '#ff9900',
    Prepared: '#54c54e',
    ResyncInProgress: '#ff9900',
    Idle: '#2e8cf0',
    Broken: '#dc1a1a',
    Empty: '#2e8cf0',
    Stopped: '#dc1a1a',
    Stopping: '#ff9900'
  }
  return colorMap[value]
}

export function diskStatus(value, type) {
  const statusMap = {
    Unknown: '未知',
    Other: '其他',
    OK: '正常',
    Degraded: '被降级',
    Error: '错误',
    Starting: '启动中',
    Stopping: '停止中',
    Stopped: '已停止',
    online: '联机',
    degraded: '被降级',
    offline: '脱机'
  }
  const colorMap = {
    Unknown: 'primary',
    Other: 'primary',
    OK: 'success',
    Degraded: 'danger',
    Error: 'danger',
    Starting: 'warning',
    Stopping: 'warning',
    Stopped: 'danger',
    online: 'success',
    degraded: 'danger',
    offline: 'danger'
  }
  return type === 'color' ? colorMap[value] : statusMap[value] || value
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
export function hostType(value) {
  const statusMap = {
    GENERIC: '通用',
    HPUX: 'HPUX',
    TPGS: 'TPGS'
  }
  return statusMap[value]
}
export function portType(value) {
  const statusMap = {
    PORTWWN: '光纤通道端口',
    ISCSI_NAME: 'iSCSI端口',
    FIBRE_CHANNEL: '光纤口',
    ISCSI: 'iSCSI端口'
  }
  return statusMap[value]
}

export function fcPortStatus(value, type) {
  const statusMap = {
    'Port active': '活动',
    'Port configured inactive': '已配置“不活动”',
    'Port unconfigured inactive': '未配置“不活动”'
  }
  return statusMap[value]
}
export function fcType(value) {
  const statusMap = {
    FC: '光纤通道'
  }
  return statusMap[value]
}

export function portStatus(value, type) {
  const statusMap = {
    offline: '脱机',
    inactive: '不活动',
    active: '活动'
  }
  const colorMap = {
    offline: 'danger',
    inactive: 'primary',
    active: 'success'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}
export function portOperateStatus(value, type) {
  const statusMap = {
    OK: '已连接',
    STOPPED: '未连接'
  }
  const colorMap = {
    OK: 'success',
    STOPPED: 'primary'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}
export function portHealthStatus(value, type) {
  const statusMap = {
    UNKNOWN: '未知',
    FRONT_END_ONLY: '仅前端',
    BACK_END_ONLY: '仅后端',
    NOT_RESTRICTED: '正常'
  }
  const colorMap = {
    UNKNOWN: 'disabled',
    FRONT_END_ONLY: 'normal',
    BACK_END_ONLY: 'primary',
    NOT_RESTRICTED: 'success'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}

export function mirrorType(value) {
  const statusMap = {
    SEQUENTIAL: '序列化',
    STRIPED: '条带化',
    IMAGE: '镜像'
  }
  return statusMap[value]
}
export function volumeType(value) {
  const statusMap = {
    STANDARD: '通用',
    THINLY_PROVISIONED: '自动精简配置',
    COMPRESSED: '压缩',
    THINLY_VOLUME: '精简卷',
    VOLUME: '普通卷'
  }
  return statusMap[value]
}
export function switchType(value) {
  const statusMap = {
    wwn: 'wwn',
    switch_port: '端口',
    alias: '别名'
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
    TORECYCLE: '待回收'
  }
  return obj[value] || '未知'
}

export function raidStatus(value, type) {
  const statusMap = {
    'Okay (OKY)': '正常',
    Optl: '最佳',
    OK: '正常',
    'Optimal (OPT)': '最佳',
    Onln: '在线',
    UGood: '正常(未使用)',
    'Ready (RDY)': '就绪'
  }
  const colorMap = {
    'Okay (OKY)': 'success',
    Optl: 'success',
    OK: 'success',
    'Optimal (OPT)': 'success',
    Onln: 'success',
    UGood: 'disabled',
    'Ready (RDY)': 'disabled'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}
export function healthStatus(value, type) {
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
export function operateStatus(value, type) {
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

export function mDiskType(value) {
  const statusMap = {
    UNKNOWN: '未知硬盘',
    NOT_SUPPORTED: '不支持的硬盘',
    UNLOCKED: '未加密硬盘',
    LOCKED: '已加密硬盘'
  }
  return statusMap[value]
}
export function iparStatus(value, type) {
  const obj = {
    'not activated': {
      name: '未激活',
      color: 'primary'
    },
    running: {
      name: '正在运行',
      color: 'success'
    },
    'open firmware': {
      name: '开放式固件',
      color: 'success'
    },
    'shutting down': {
      name: '正在关闭',
      color: 'warning'
    },
    starting: {
      name: '正在启动',
      color: 'warning'
    },
    'migrating not active': {
      name: '迁移不活跃',
      color: 'warning'
    },
    'migrating running': {
      name: '正在迁移',
      color: 'warning'
    },
    'hardware discovery': {
      name: '硬件发现',
      color: 'normal'
    },
    suspended: {
      name: ' 暂停',
      color: 'warning'
    },
    suspending: {
      name: '正在暂停',
      color: 'warning'
    },
    resuming: {
      name: '正在恢复',
      color: 'warning'
    },
    'not available': {
      name: '不可用',
      color: 'disabled'
    },
    error: {
      name: ' 错误',
      color: 'danger'
    },
    PARTITION_CREATING: {
      name: '创建中',
      color: 'primary'
    },
    PARTITION_UPDATING: {
      name: '更新中',
      color: 'primary'
    },
    PARTITION_DELETING: {
      name: ' 删除中',
      color: 'danger'
    },
    INSTALLING: {
      name: ' 装机中',
      color: 'success'
    },
    INSTALL_OK: {
      name: '装机成功',
      color: 'success'
    },
    INSTALL_FAIL: {
      name: '装机失败',
      color: 'danger'
    },
    INSTALL_CANCEL: {
      name: '装机取消',
      color: 'warning'
    },
    POWERON_RUNNING: {
      name: ' 正在激活',
      color: 'warning'
    },
    POWEROFF_RUNNING: {
      name: ' 正在关闭',
      color: 'warning'
    },
    RESTART_RUNNING: {
      name: ' 正在重启',
      color: 'warning'
    }
  }
  return obj[value] && obj[value][type]
}
export function partitionType(value) {
  const obj = {
    OS400: 'IBM i',
    'Virtual IO Server': 'VIO服务器',
    'AIX/Linux': 'AIX/Linux'
  }
  return obj[value]
}
export function sharingMode(value) {
  const obj = {
    capped: '受限',
    uncapped: '不受限'
  }
  return obj[value]
}
export function bootModeType(value) {
  const obj = {
    Normal: '正常',
    System_Management_Services: '系统管理服务（SMS）',
    Diagnostic_With_Default_Boot_List: '使用缺省引导列表（DIAG_DEFAULT）进行诊断',
    Diagnostic_With_Stored_Boot_List: '使用存储的列表（DIAG_STORED）进行诊断',
    Open_Firmware: '开放式固件正常提示'
  }
  return obj[value]
}
export function tipStatus(status) {
  const statusMap = {
    true: '打开',
    false: '关闭'
  }
  return statusMap[status]
}
export function disabledStatus(status) {
  const statusMap = {
    true: '已启用',
    false: '已禁用'
  }
  return statusMap[status]
}
export function rmcState(value, type) {
  const obj = {
    inactive: {
      name: '不活动',
      color: 'danger'
    },
    none: {
      name: '无',
      color: 'primary'
    },
    active: {
      name: '活动',
      color: 'success'
    },
    unknown: {
      name: '未知',
      color: 'primary'
    }
  }
  return obj[value] && obj[value][type]
}
export function serverStatus(status) {
  const statusMap = {
    operating: '运行',
    'power off': '断电',
    initializing: '正在初始化',
    standby: '待机',
    'service processor failover': '服务处理器故障',
    'power off in progress': '正在断电',
    error: '错误',
    'error - dump in progress': '错误-正在转储',
    'error - terminated': '错误-终止',
    'version mismatch': '版本不匹配',
    incomplete: '残缺',
    recovery: '恢复',
    'no connection': '未连接',
    'failed authentication': '身份验证失败',
    'pending authentication - password updates required': '等待验证-需要更新密码',
    CREATE_RUNNING: '创建中',
    POWERON_RUNNING: '开机中',
    POWEROFF_RUNNING: '断电中',
    REMOVE_CONNECTION_RUNNING: '关闭连接中',
    RESET_CONNECTION_RUNNING: '重置连接中',
    UPDATE_RUNNING: '正在更新'
  }
  return statusMap[status] || status
}
export function serverStatusColor(value) {
  switch (value) {
    case 'operating':
    case 'recovery':
    case 'no connection':
    case 'CREATE_RUNNING':
    case 'POWERON_RUNNING':
      return 'normal'
    case 'power off':
    case 'service processor failover':
    case 'error':
    case 'error - dump in progress':
    case 'error - terminated':
    case 'version mismatch':
    case 'incomplete':
    case 'failed authentication':
    case 'POWEROFF_RUNNING':
    case 'REMOVE_CONNECTION_RUNNING':
    case 'RESET_CONNECTION_RUNNING':
    case '删除中':
      return 'danger'
    case 'initializing':
    case 'standby':
    case 'power off in progress':
    case 'pending authentication - password updates required':
    case 'UPDATE_RUNNING':
      return 'warning'
    default:
      return 'normal'
  }
}
export function normalStatus(status) {
  const status1 = status.toLowerCase()
  const statusMap = {
    normal: '正常',
    'power off': '断电'
  }
  return statusMap[status1] || status
}
export function powerOnSpeedOverride(status) {
  const statusMap = {
    fast: '快速',
    slow: '慢速',
    null: '不覆盖',
    Unknown: '未知'
  }
  return statusMap[status]
}
export function Keylock(status) {
  const statusMap = {
    manual: '手动',
    normal: '正常'
  }
  return statusMap[status]
}
export function PowerOnSide(status) {
  const statusMap = {
    Permanent: '永久',
    Temporary: '临时'
  }
  return statusMap[status]
}

export function LparStartPolicy(status) {
  const statusMap = {
    userinit: '用户启动',
    autostart: '始终自动启动',
    autorecovery: '自动启动以执行自动恢复'
  }
  return statusMap[status]
}
export function objectStorageStatusFilter(value, type) {
  const cnUserData = {
    ACTIVE: '可用',
    BUILDING: '正在创建',
    RUNNING: '运行中',
    EXCEPTION: '创建失败',
    ERROR: '错误',
    PENDING_CREATE: '等待创建'
  }
  const colorMap = {
    BUILDING: 'normal',
    RUNNING: 'success',
    ACTIVE: 'success',
    EXCEPTION: 'danger',
    ERROR: 'danger',
    PENDING_CREATE: 'warning'
  }
  return type === 'color' ? colorMap[value] || 'danger' : cnUserData[value] || '未知'
}
export function accountFilter(value) {
  const obj = {
    Standard_LRS: '本地冗余存储(LRS)',
    Standard_GRS: '异地冗余存储(GRS)',
    Standard_ZRS: '区域冗余存储(ZRS)',
    Standard_RAGRS: '读取访问异地冗余存储(RA-GRS)',
    Premium_LRS: '本地冗余存储(LRS)',
    Storage: 'Storage（通用版v1）',
    StorageV2: 'StorageV2（通用版v2）',
    BlobStorage: 'BlobStorage'
  }
  return obj[value]
}
export function xskyStatus(value, type) {
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
export function qosEnabled(value) {
  const obj = {
    true: '开启',
    false: '未开启'
  }
  return obj[value]
}
export function priority(value) {
  const obj = {
    0: '默认',
    1: '优先'
  }
  return obj[value]
}
export function NoValue(value) {
  return value || '暂无'
}
export function rolePoolType(value) {
  const obj = {
    data: '数据池',
    index: '对象索引池'
  }
  return obj[value]
}
export function roleDiskType(value) {
  const obj = {
    data: '数据盘',
    HDD: '混合盘'
  }
  return obj[value] || '未知'
}
export function syncStatus(value) {
  const statusMap = {
    0: '已同步',
    1: '已同步',
    '-1': '未同步'
  }
  return statusMap[value]
}
export function xskyHostType(value) {
  const statusMap = {
    storage_server: '存储服务器',
    storage_client: '网关服务器'
  }
  return statusMap[value]
}
export function deviceType(value) {
  const obj = {
    Hybrid: '混合盘'
  }
  return obj[value] || value
}
export function aclStatus(value, type) {
  const statusMap = {
    true: '开启',
    false: '关闭'
  }
  const colorMap = {
    true: 'success',
    false: 'disabled'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}

export function loggedStatus(value, type) {
  const statusMap = {
    true: '已登录',
    false: '未登录'
  }
  const colorMap = {
    true: 'success',
    false: 'danger'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
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
export function stateFliter(value, type) {
  const statusMap = {
    running: '运行中',
    flow: '流控',
    idle: ' 空闲',
    blocked: '阻塞',
    unblocked: '未阻塞'
  }
  const colorMap = {
    running: 'success',
    flow: 'normal',
    idle: 'normal',
    blocked: 'danger',
    unblocked: 'normal'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}
export function deviceStatus(value, type) {
  const obj = {
    ONLINE: {
      name: '在线',
      color: 'success'
    },
    OFFLINE: {
      name: '离线',
      color: 'disabled'
    },
    SUBHEALTH: {
      name: '亚健康',
      color: 'warning'
    }
  }
  return obj[value] && obj[value][type]
}
export function floatIpStatus(value) {
  const obj = {
    DOWN: '未绑定',
    ACTIVE: '已绑定',
    ERROR: '异常'
  }
  return obj[value]
}

export function aliStatus(status) {
  const statusMap = {
    inactive: '已停止',
    active: '运行中',
    locked: '已锁定',
    Creating: '创建中',
    Available: '可用',
    Modifying: '修改中',
    Deleting: '删除中',
    Converting: '变更中'
  }
  return statusMap[status]
}

export function specFilter(value) {
  const obj = {
    Basic: '基本',
    GeneralPurpose: '常规用途',
    MemoryOptimized: '优化内存'
  }
  return obj[value] || value
}
