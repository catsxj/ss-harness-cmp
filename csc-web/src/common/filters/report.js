// 报表周期类型
export function reportCycleType(value) {
  const obj = {
    ByDay: '日报',
    ByWeek: '周报',
    ByMonth: '月报'
  }
  return obj[value]
}

// 报表周报汉化
export function weekFilter(value) {
  const obj = {
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    0: '周日'
  }
  return obj[value]
}

// 报表周期类型
export function reportStatusType(value) {
  const obj = {
    false: '未启用',
    true: '启用'
  }
  return obj[value]
}

export function reportStatusTypeColor(value) {
  const obj = {
    false: 'normal',
    true: 'success'
  }
  return obj[value]
}
