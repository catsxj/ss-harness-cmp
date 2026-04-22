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

// 虚拟机状态颜色
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
    DOWN: 'info'
  }
  return statusMap[status] || 'danger'
}

export function taskStatusFilter(value, type) {
  const statusMap = {
    DEVELOPING: '开发中',
    APPROVING: '发布中',
    APPROVED: ' 已发布'
  }
  const colorMap = {
    DEVELOPING: 'normal',
    APPROVING: 'warning',
    APPROVED: 'success'
  }
  return type === 'color' ? colorMap[value] : statusMap[value]
}

// 任务类型
export function taskTypeFilter(value) {
  const obj = {
    SCRIPT: '执行脚本',
    FILE: '文件分发',
    BACKUP: '文件备份',
    RECOVERY: '文件恢复',
    HTTP: 'HTTP请求',
    DATABASE: '数据库',
    POINT: '聚合节点'
  }
  return obj[value]
}
// 审批状态
export function applyStatusFilter(value, type) {
  const obj = {
    // APPROVING: {
    //   name: '审批中',
    //   color: 'normal'
    // },
    // REFUSED: {
    //   name: '审批拒绝',
    //   color: 'danger'
    // },
    APPROVED: {
      name: '已发布',
      color: 'success'
    },
    DEVELOPING: {
      name: '开发中',
      color: 'normal'
    },
    UNAPPLY: {
      name: '未发布',
      color: 'primary'
    },
    CREATED: {
      name: '新创建',
      color: 'normal'
    }
  }
  return obj[value] && obj[value][type]
}
// 任务执行状态
export function taskExeStatusFilter(value, type = 'name') {
  const obj = {
    CREATED: {
      name: '未执行',
      color: 'normal'
    },
    NOREADY: {
      name: '已跳过',
      color: 'warning'
    },
    READY: {
      name: '准备中',
      color: 'normal'
    },
    WAITTING: {
      name: '等待执行',
      color: 'primary'
    },
    CANCELING: {
      name: '取消中',
      color: 'primary'
    },
    RUNNING: {
      name: '正在执行',
      color: 'normal'
    },
    SUCCESS: {
      name: '执行成功',
      color: 'success'
    },
    SUSPENDED: {
      name: '已暂停',
      color: 'warning'
    },
    FAILED: {
      name: '执行失败',
      color: 'danger'
    },
    CANCELED: {
      name: '手动结束',
      color: 'warning'
    },
    EXCEPTION: {
      name: '执行异常',
      color: 'danger'
    }
  }
  return obj[value] && obj[value][type] // 容错处理（初始化值不存在）
}
