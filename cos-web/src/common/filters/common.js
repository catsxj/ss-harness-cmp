export function numberFilter(value, digit) {
  return value.toFixed(digit)
}

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

export function status(value, type) {
  const levelData = {
    NORMAL: '正常',
    ALARM: '告警',
    ABNORMAL: '异常',
    DISABLED: '不可用'
  }
  const colorMap = {
    NORMAL: 'success',
    ALARM: 'warning',
    ABNORMAL: 'danger',
    DISABLED: 'disabled'
  }
  return type == 'color' ? colorMap[value] : levelData[value]
}
