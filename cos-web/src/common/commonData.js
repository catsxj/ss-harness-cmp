/**
 * Created by Zhang Haijun on 2017/8/31.
 */
export const taskExeOptions = {
  RUNNING: ' 正在执行',
  SUCCESS: '执行成功',
  FAILED: '执行失败',
  EXCEPTION: ' 执行异常',
  CANCELED: '手动结束',
  SUSPENDED: '已暂停'
}
export const authenModeOptions = {
  BATCH: '批量认证',
  TRUST: '互信认证',
  SINGLE: '单一认证'
}
export const environmentData = {
  DEVELOP: '开发环境',
  TEST: '测试环境',
  PRODUCTION: '生产环境',
  READY: '预发环境',
  UAT: 'UAT环境'
}
export const networkType = {
  0: '容器镜像',
  1: '云主机镜像',
  2: 'rpm安装',
  3: '应用程序包',
  4: '其他'
}
export const httpMethod = ['GET', 'POST', 'PUT', 'DELETE']
export const httpFormat = ['RAW', 'FORM_DATA', 'FORM_URLENCODED', 'BINARY']
export const scriptTypeData = [
  { name: 'shell', value: 'SHELL' },
  { name: 'bat', value: 'BAT' },
  { name: 'perl', value: 'PERL' },
  { name: 'python', value: 'PYTHON' },
  { name: 'playbook', value: 'PLAYBOOK' },
  { name: 'powershell', value: 'POWERSHELL' }
]

export const hostType = {
  MAINFRAME: '大型机',
  MINICOMPUTER: '小型机',
  PC: 'PC',
  X86: 'X86服务器'
}
export const funData = [{ name: 'mean' }, { name: 'median' }, { name: 'count' }, { name: 'min' }, { name: 'max' }, { name: 'sum' }, { name: 'first' }, { name: 'last' }, { name: 'spread' }, { name: 'stddev' }]

export const processLevel = [
  { name: '一般', value: 'COMMON' },
  { name: '紧急', value: 'EMERGENCY' }
]
