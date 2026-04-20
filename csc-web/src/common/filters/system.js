export function promotions(value, type) {
  const levelData = {
    Created: '未审批',
    Approved: '已通过',
    Approving: '审批中',
    Refused: '已拒绝',
    Invalid: '已作废'
  }
  return levelData[value]
}

export function promotionsColor(value, type) {
  const colorMap = {
    Created: 'warning',
    Approved: 'success',
    Approving: 'warning',
    Refused: 'danger',
    Invalid: 'disabled'
  }
  return colorMap[value]
}
export function promotionsSla(value, type) {
  const levelData = {
    Created: '新创建',
    Approved: '已通过',
    Approving: '审批中',
    Refused: '已拒绝',
    Invalid: '已作废'
  }
  return levelData[value]
}

export function promotionsType(value, type) {
  const levelData = {
    reduction: '满减',
    discount: '满折'
  }
  return levelData[value]
}

export function orderStatusFilter(value, type) {
  const cnUserData = {
    OpenedSuccess: '开通成功',
    OpenedFailure: '开通失败',
    Opening: '正在开通',
    CreateSuccess: '创建成功',
    CreateFailure: '创建失败',
    Creating: '正在创建',
    ChangeSuccess: '变更成功',
    ChangeFailure: '变更失败',
    Changing: '正在变更',
    UnsubscribeSuccess: '退订成功',
    UnsubscribeFailure: '退订失败',
    Unsubscribing: '正在退订',
    Abandoned: '已废弃',
    creating: '创建中',
    ready: '创建成功',
    failed: '创建失败',
    exception: '创建异常',
    success: '成功',
    failure: '失败',
    canceld: '已取消',
    Canceld: '已取消',
    ExtensionSuccess: '延期成功',
    ExtensionFailure: '延期失败',
    Extensioning: '延期中',
    Termination: '已终止'
  }
  const colorMap = {
    OpenedSuccess: 'success',
    OpenedFailure: 'danger',
    Opening: 'normal',
    CreateSuccess: 'success',
    CreateFailure: 'danger',
    Creating: 'normal',
    ChangeSuccess: 'success',
    ChangeFailure: 'danger',
    Changing: 'normal',
    UnsubscribeSuccess: 'success',
    UnsubscribeFailure: 'danger',
    Unsubscribing: 'normal',
    Abandoned: 'danger',
    creating: 'warning',
    ready: 'success',
    failed: 'danger',
    exception: 'danger',
    success: 'success',
    failure: 'danger',
    canceld: 'normal',
    Canceld: 'normal',
    ExtensionSuccess: 'success',
    ExtensionFailure: 'danger',
    Extensioning: 'warning',
    Termination: 'danger'
  }
  return type === 'color' ? colorMap[value] : cnUserData[value]
}

export function coupon(value, type) {
  const levelData = {
    unused: '未使用',
    used: '已使用',
    expired: '已过期'
  }
  return levelData[value]
}

export function chargeMode(value, type) {
  const levelData = {
    PreCharge: '预付费',
    PostCharge: '后付费'
  }
  return levelData[value]
}

export function couponColor(value, type) {
  const colorMap = {
    unused: 'primary',
    used: 'success',
    expired: 'danger'
  }
  return colorMap[value]
}
// 账单状态
export function billStatusFilter(value) {
  const obj = {
    unpay: '未支付',
    paid: '已支付',
    paying: '支付中',
    canceld: '已取消'
  }
  return obj[value]
}
