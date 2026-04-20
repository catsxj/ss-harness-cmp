// 监控告警延时是否
export function isTrue(value) {
  const obj = {
    true: '是',
    false: '否',
    0: '否',
    1: '是'
  }
  return obj[value] || '否'
}

// 告警级别
export function alarmLevel(value, type) {
  const levelData = {
    REMIND: '提示告警',
    PRIMARY: '重要告警',
    SECONDARY: '次要告警',
    URGENT: '紧急告警'
  }
  return levelData[value]
}

export function alarmLevelColor(value, type) {
  const colorMap = {
    REMIND: 'info',
    PRIMARY: 'primary',
    SECONDARY: 'warning',
    URGENT: 'danger',
    DANGER: 'danger'
  }
  return colorMap[value]
}

export function resourceTypeMonitor(value) {
  const statusMap = {
    MONITOR_VCENTER_HOST: 'vSphere宿主机',
    MONITOR_VCENTER_VM: 'vSphere云主机',
    MONITOR_VCENTER_DATASTORE: 'vSphere数据存储',
    MONITOR_INSPUR_RAIL_HOST: '浪潮云宿主机',
    MONITOR_INSPUR_RAIL_VM: '浪潮云云主机',
    MONITOR_CLOUDTOWER_HOST: 'CloudTower宿主机',
    MONITOR_CLOUDTOWER_VM: 'CloudTower云主机',
    MONITOR_OPENSTACK_HOST: 'OpenStack宿主机',
    MONITOR_OPENSTACK_VM: 'OpenStack云主机',
    MONITOR_OPENSTACK_SERVICE: 'OpenStack服务',
    MONITOR_FUSIONCLOUD_HOST: 'FUSIONCLOUD宿主机',
    MONITOR_FUSIONCLOUD_VM: 'FUSIONCLOUD云主机',
    MONITOR_MANAGEONE_HOST: 'ManageOne宿主机',
    MONITOR_MANAGEONE_VM: 'ManageOne宿主机',
    MONITOR_TIANYI_VM: '天翼云ECS',
    MONITOR_ALIYUN_VM: '阿里云ECS',
    MONITOR_H3C_VM: 'H3C云主机',
    MONITOR_H3C_HOST: 'H3C主机',
    MONITOR_HUAWEI_VM: '华为云ECS',
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
    BOC_CONTAINER: '容器'
  }
  return statusMap[value] || value
}
export function alarmMetric(value) {
  const statusMap = {
    cpuUsageAverage: 'CPU利用率(%)',
    memUsageAverage: '内存利用率(%)',
    diskUsedPercent: '磁盘利用率(%)',
    cpuReadySummation: 'CPU就绪时间(毫秒)',
    diskUsageAverage: '磁盘使用情况(KBps)',
    netUsageAverage: '网络使用情况(KBps)',
    memLlSwapUsageAverage: '内存交换空间(KB)'
  }
  return statusMap[value]
}
