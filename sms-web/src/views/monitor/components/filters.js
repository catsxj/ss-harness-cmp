/**
 * Created by HaijunZhang on 2019/12/17.
 */
// 任务执行状态
export function statusFilter(value, type = 'name') {
  const obj = {
    running: {
      name: '运行中',
      color: 'success'
    },
    error: {
      name: '异常',
      color: 'danger'
    },
    warning: {
      name: '告警',
      color: 'warning'
    }
  }
  return obj[value] && obj[value][type] // 容错处理（初始化值不存在）
}
export const colorMap = {
  running: 'green',
  warning: 'yellow',
  error: 'red'
}
export const borderColorMap = {
  running: '#A3E5C3',
  warning: '#FF9900',
  error: '#DC1A1A'
}
