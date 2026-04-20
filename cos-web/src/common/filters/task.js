export function taskStatusFlilter(value, type) {
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

export function authenModeFilter(value) {
  const obj = {
    BATCH: '批量认证',
    TRUST: '互信认证',
    SINGLE: '单一认证'
  }
  return obj[value] || '无'
}
