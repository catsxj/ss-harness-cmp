export function numberFilter(value, digit) {
  return value.toFixed(digit)
}

export function paymentModeFilter(val) {
  const obj = {
    Hour: '按量付费',
    Month: '包年包月'
  }
  return obj[val] || ''
}
// 正反编译
export function booleanFilter(value) {
  const obj = {
    true: '是',
    false: '否',
    1: '是',
    0: '否',
    YES: '是',
    NO: '否',
    null: '否'
  }
  return obj[value] || value
}

export function sexFilter(value) {
  const obj = {
    true: '男',
    false: '女'
  }
  return obj[value]
}

export function generalStatusFilter(value, type) {
  const cnUserData = {
    NORMAL: '正常',
    ABNORMAL: '已冻结',
    EXPIRED: '已过期',
    LOGOUT: '已注销'
  }
  const colorMap = {
    ABNORMAL: 'danger',
    NORMAL: 'success',
    EXPIRED: 'warning',
    LOGOUT: 'primary'
  }
  return type == 'color' ? colorMap[value] : cnUserData[value]
}
