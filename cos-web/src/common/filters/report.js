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
