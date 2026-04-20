// 正反编译
export function booleanFilter(value) {
  const obj = {
    true: '是',
    false: '否',
    1: '是',
    0: '否',
    YES: '是',
    NO: '否'
  }
  return obj[value] || value
}

export function securityGroupFilter(value) {
  const obj = {
    ingress: '入口',
    egress: '出口'
  }
  return obj[value]
}

export function secruityProtocolFilter(value) {
  const obj = {
    TCP: 'TCP',
    ICMP: 'ICMP',
    UDP: 'UDP',
    null: '任何'
  }
  return obj[value] || value
}

export function statusFilter(value) {
  const levelData = {
    NORMAL: '正常',
    ALARM: '告警',
    ABNORMAL: '异常',
    DISABLED: '不可用'
  }
  return levelData[value]
}
export function etherTypeFilter(value) {
  const obj = {
    IPv4: 'IPv4',
    IPv6: 'IPv6',
    null: '任何'
  }
  return obj[value]
}
// 监控告警延迟时间
export function waiteTimeFilter(value) {
  const obj = {
    0: '立刻',
    5: '5分钟',
    10: '10分钟',
    30: '30分钟',
    60: '1小时',
    360: '6小时',
    720: '12小时',
    1440: '24小时'
  }
  return obj[value]
}
// 告警级别
export function alarmLevelFilter(value, type) {
  const levelData = {
    REMIND: '提示告警',
    PRIMARY: '重要告警',
    SECONDARY: '次要告警',
    URGENT: '紧急告警'
  }
  return levelData[value]
}

export function alarmLevelColorFilter(value, type) {
  const colorMap = {
    REMIND: 'info',
    PRIMARY: 'primary',
    SECONDARY: 'warning',
    URGENT: 'danger',
    DANGER: 'danger'
  }
  return colorMap[value]
}

// 平台监控通断状态颜色
export function statusOnColorFilter(value) {
  const obj = {
    断开: 'danger',
    正常: 'success'
  }
  return obj[value] || 'primary'
}

export function resourceTypeMonitorFilter(value) {
  const statusMap = {
    MONITOR_VCENTER_HOST: 'vSphere宿主机',
    MONITOR_VCENTER_VM: 'vSphere云主机',
    MONITOR_ZSTACK_VM: 'ZStack云主机',
    MONITOR_ZSTACK_HOST: 'ZStack宿主机',
    MONITOR_SANGFOR_SCP_HOST: '深信服SCP宿主机',
    MONITOR_SANGFOR_SCP_VM: '深信服SCP云主机',
    MONITOR_SANGFOR_HCI_HOST: '深信服HCI宿主机',
    MONITOR_SANGFOR_HCI_VM: '深信服HCI云主机',
    MONITOR_VCENTER_DATASTORE: 'vSphere数据存储',
    MONITOR_FUSIONSPHERE_HOST: 'FUSIONSPHERE宿主机',
    MONITOR_FUSIONSPHERE_VM: 'FUSIONSPHERE云主机',
    MONITOR_INSPUR_RAIL_HOST: '浪潮云宿主机',
    MONITOR_INSPUR_RAIL_VM: '浪潮云云主机',
    MONITOR_OPENSTACK_HOST: 'OpenStack宿主机',
    MONITOR_OPENSTACK_VM: 'OpenStack云主机',
    MONITOR_OPENSTACK_SERVICE: 'OpenStack服务',
    MONITOR_EASYSTACK_HOST: 'EasyStack宿主机',
    MONITOR_EASYSTACK_VM: 'EasyStack云主机',
    MONITOR_EASYSTACK_SERVICE: 'EasyStack服务',
    MONITOR_FUSIONCLOUD_HOST: 'FUSIONCLOUD宿主机',
    MONITOR_FUSIONCLOUD_VM: 'FUSIONCLOUD云主机',
    MONITOR_MANAGEONE_HOST: 'ManageOne宿主机',
    MONITOR_MANAGEONE_VM: 'ManageOne宿主机',
    MONITOR_TIANYI_VM: '天翼云ECS',
    MONITOR_ALIYUN_VM: '阿里云ECS',
    MONITOR_CECSTACK_VM: '电子云ECS',
    MONITOR_H3C_VM: 'H3C云主机',
    MONITOR_H3C_HOST: 'H3C主机',
    MONITOR_HUAWEI_VM: '华为云ECS',
    MONITOR_SMARTX_VM: 'SMARTX云主机',
    MONITOR_SMARTX_HOST: 'SMARTX宿主机',
    MONITOR_CLOUDTOWER_HOST: 'CloudTower宿主机',
    MONITOR_CLOUDTOWER_VM: 'CloudTower云主机',
    MONITOR_STORAGE_DELL_STORAGE: 'Dell存储设备',
    MONITOR_STORAGE_DELL_DISK: 'Dell磁盘',
    MONITOR_STORAGE_DELL_VOLUME: 'Dell存储卷',
    MONITOR_STORAGE_HUAWEI_STORAGE: '华为存储设备',
    MONITOR_STORAGE_HUAWEI_DISK: '华为磁盘',
    MONITOR_STORAGE_HUAWEI_VOLUME: '华为存储卷',
    MONITOR_XSKY_HOST: 'XSKY服务器',
    MONITOR_XSKY_OBJECT_USER: 'XSKY对象用户',
    MONITOR_XSKY_OBJECT_ROUTER: 'XSKY对象路由',
    MONITOR_XSKY_OBJECT_BUCKET: 'XSKY存储桶',
    MONITOR_XSKY_VOLUME: 'XSKY块存储卷',
    MONITOR_XSKY_VOLUME_POOL: 'XSKY存储池',
    MONITOR_XSKY_CEPH_OSD: 'XSKY硬盘',
    MONITOR_XSKY_DISK: 'XSKY缓存',
    MONITOR_XSKY_FILESYSTEM: 'XSKY文件系统',
    MONITOR_DATABASE_MYSQL: '云数据库 MySQL',
    MONITOR_DATABASE_ORACLE: '云数据库 Oracle',
    MONITOR_DATABASE_REDIS: '云数据库 Redis',
    MONITOR_DATABASE_MONGODB: '云数据库 Mongodb',
    MONITOR_DATABASE_MSSQL: '云数据库 Mssql',
    MONITOR_KUBERNETES_NODE: 'Kubernetes节点',
    MONITOR_KUBERNETES_SERVICE: 'Kubernetes服务',
    MONITOR_KUBERNETES_POD: 'Kubernetes容器组',
    MONITOR_HMC_SERVER: 'HMC主机',
    MONITOR_HMC_VIOS: 'HMC VIOS',
    MONITOR_HMC_AIX: 'HMC逻辑分区',
    MONITOR_RDS_MYSQL: '云数据库 MySQL',
    MONITOR_RDS_SQLSERVER: '云数据库 SQL Server',
    MONITOR_RDS_POSTGRESQL: '云数据库 PostGreSQL',
    MONITOR_RDS_ORACLE: '云数据库 Oracle',
    MONITOR_KVS_REDIS: '云数据库 Redis',
    MONITOR_KVS_MONGODB: '云数据库 Mongodb',
    MONITOR_KVS_MEMCACHED: '云数据库 MemCached',
    MONITOR_CMS_KAFKA: '消息队列 Kafka',
    MONITOR_CMS_RABBITMQ: '消息队列 RabbitMQ',
    MONITOR_CCS_ZOOKEEPER: '配置中心 Zookeeper',
    MONITOR_CCS_ETCD: '配置中心 Etcd',
    BOC_HOST: '主机',
    BOC_CONTAINER: '容器',
    MONITOR_YYJQCLOUD_VM: '青云（云易捷）ECS'
  }
  return statusMap[value] || value
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

export function platformStatusFilter(status) {
  const statusMap = {
    NORMAL: '连接正常',
    ABNORMAL: '连接异常',
    DANGER: '严重警告',
    WARN: '警告'
  }
  return statusMap[status]
}

// 云主机状态
export function openstackServerFilter(status) {
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
    enabled: '可用'
  }
  return statusMap[status] || '未知'
}

// 云主机状态颜色
export function vmStatusColorFilter(status) {
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
    enabled: 'success'
  }
  return statusMap[status] || 'danger'
}
export function databaseFilter(value) {
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
