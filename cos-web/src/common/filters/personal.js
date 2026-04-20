export function level(value, type) {
  const levelData = {
    DEADLY: '致命',
    HIGH: '严重',
    SERIOUS: '高危',
    MEDIUM: '中等',
    COMMON: '普通'
  }
  const colorMap = {
    DEADLY: 'danger',
    HIGH: 'warning',
    SERIOUS: 'primary',
    MEDIUM: 'normal',
    COMMON: 'success'
  }
  return type == 'color' ? colorMap[value] : levelData[value]
}

export function messageStatusFilter(value, type) {
  const statusMap = {
    READ: '已读',
    UNREAD: '未读'
  }
  const colorMap = {
    READ: 'success',
    UNREAD: 'warning'
  }
  return type == 'color' ? colorMap[value] : statusMap[value]
}

export function adminStateupFilter(value) {
  const obj = {
    true: '开启',
    false: '关闭'
  }
  return obj[value]
}

// 流程状态
export function templateState(value) {
  const obj = {
    ACTIVE: '活动中',
    TERMINATION: '已终止',
    CANCEL: '已撤销',
    FINISH: '已结束'
  }
  return obj[value]
}

// 流程状态
export function templateStateColor(value) {
  const obj = {
    ACTIVE: 'normal',
    TERMINATION: 'warning',
    CANCEL: 'warning',
    FINISH: 'danger'
  }
  return obj[value]
}

// 服务状态
export function flowServiceStatus(value, type) {
  const obj = {
    UNAPPLY: {
      name: '未申请',
      color: 'normal'
    },
    UNRATIFIED: {
      name: '未批准',
      color: 'normal'
    },
    UNPUBLISHED: {
      name: '未发布',
      color: 'normal'
    },
    EXPIRED: {
      name: '已过期',
      color: 'danger'
    },
    SOLDOUT: {
      name: '已下架',
      color: 'danger'
    },
    PUBLISHED: {
      name: '已上架',
      color: 'success'
    },
    APPROVED: {
      name: '已申请',
      color: 'success'
    },
    PUBLISH_APPLYING: {
      name: '发布审批中',
      color: 'primary'
    },
    IMMINENT_EXPIRY: {
      name: '即将过期',
      color: 'primary'
    },
    POSTPONE_APPLYING: {
      name: '延期申请中',
      color: 'primary'
    },
    SOLDOUT_APPLYING: {
      name: '下架审批中',
      color: 'primary'
    },
    APPLYING: {
      name: '申请中',
      color: 'primary'
    },
    USEING: {
      name: '使用中',
      color: 'primary'
    }
  }
  return obj[value] && obj[value][type]
}

// 审批状态
export function applyStatus(value, type) {
  const obj = {
    APPROVING: {
      name: '审批中',
      color: 'normal'
    },
    REFUSED: {
      name: '审批拒绝',
      color: 'danger'
    },
    APPROVED: {
      name: '审批通过',
      color: 'success'
    },
    UNAPPLY: {
      name: '未申请',
      color: 'primary'
    },
    CREATED: {
      name: '新创建',
      color: 'normal'
    }
  }
  return obj[value] && obj[value][type]
}

export function workOrder(value) {
  const obj = {
    submitted: '已提交',
    feedback: '已反馈',
    closed: '已关闭'
  }
  return obj[value]
}

export function categoryFilter(value) {
  const obj = {
    TaskRelease: '作业发布',
    TaskTemplateRelease: '作业模板发布',
    ServiceRelease: '服务发布',
    ServiceUnrelease: '服务下架',
    CommonTaskStart: '常规任务执行',
    SimpleTaskStart: '快捷任务执行',
    CronTaskStart: '定时任务执行',
    ScriptUpload: '脚本上传',
    SoftwareUpload: '文件上传',
    SoftwareInstall: '软件安装',
    ResourceComputerApply: '云主机申请',
    ResourceImageApply: '镜像申请',
    ResourceStorageApply: '云硬盘申请',
    ResourceSnapshotApply: '快照申请',
    ResourceRouterApply: '云路由申请',
    ResourceFloatingIpApply: '浮动IP申请',
    ExpansionSpecApply: '扩容云主机规格申请',
    ExpansionDiskApply: '扩容云主机磁盘申请',
    ServiceSlaAudit: '服务SLA审核',
    PromotionAudit: '优惠活动审核',
    ServiceSkuRelease: '服务产品上架',
    ServiceSkuRevoke: '服务产品批量下架',
    ServiceSkuBatchRelease: '服务产品上架',
    ServiceSkuBatchRevoke: '服务产品批量下架',
    EFCApplicationOperate: '服务使用申请',
    ApplicationOperate: '服务使用申请',
    EFCAlterationOperate: '服务实例变更',
    AlterationOperate: '服务实例变更',
    ExtensionOperate: '服务实例延期',
    EFCExtensionOperate: '服务实例延期',
    EFCUnsubscribeOperate: '服务实例退订',
    UnsubscribeOperate: '服务实例退订',
    ResourceComputerClone: '云主机克隆',
    EFCSnapshotApplicationOperate: '服务快照申请',
    BacthUnsubscribeOperate: '服务实例退订'
  }
  return obj[value]
}

export function workOrderColor(value) {
  const obj = {
    submitted: 'normal',
    feedback: 'warning',
    closed: 'success'
  }
  return obj[value]
}

export function category(value) {
  const obj = {
    gp2: '通用型 SSD',
    io1: '预配置 IOPS SSD',
    sc1: 'Cold HDD',
    st1: '吞吐优化 HDD',
    standard: '磁介质'
  }
  return obj[value]
}

export function templateStatusFilter(value, type) {
  const statusMap = {
    ACTIVE: '审批中',
    FINISH: '审批通过',
    TERMINATION: '审核驳回',
    CANCEL: '已撤销'
  }
  const colorMap = {
    ACTIVE: 'normal',
    FINISH: 'success',
    TERMINATION: 'warning',
    CANCEL: 'warning'
  }
  return type == 'color' ? colorMap[value] : statusMap[value]
}
