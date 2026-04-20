import { taskExeStatusFilter } from '@/filters'
export function statusFilter(status: string) {
  const map: any = {
    NotConfig: '未配置',
    Complete: '配置完成',
    Error: '配置有误',
    Default: '初始化配置'
  }
  return map[status] || taskExeStatusFilter(status)
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
    Default: 'el-icon-success',
    Error: 'el-icon-error'
  }
  return map[status] || 'warning.png'
}
export const flowNodeOption = {
  statusFilter,
  statusIconFilter
}
