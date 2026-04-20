export function iparStatusFilter(value, type) {
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
export function partitionTypeFilter(value) {
  const obj = {
    OS400: 'IBM i',
    'Virtual IO Server': 'VIO服务器',
    'AIX/Linux': 'AIX/Linux'
  }
  return obj[value]
}
