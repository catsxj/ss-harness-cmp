export function statusFilter(status: string) {
  const map: any = {
    NotConfig: '未配置',
    Complete: '配置完成',
    Error: '配置有误'
  }
  return map[status]
}
export function statusIconFilter(status: string) {
  const map: any = {
    NOREADY: 'skip.png',
    READY: 'ready.png',
    SUCCESS: 'success.png',
    FAILED: 'fail.png',
    SUSPENDED: 'warning.png',
    RUNNING: 'el-icon-loading',
    NotConfig: 'el-icon-warning',
    Complete: 'el-icon-success',
    Error: 'el-icon-error'
  }
  return map[status] || ''
}
export const flowNodeOption = {
  statusFilter,
  statusIconFilter
  // imagePrefix: ''
}
