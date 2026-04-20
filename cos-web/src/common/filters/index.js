import Vue from 'vue'
import * as common from './common'
import * as monitor from './monitor'
import * as resource from './resource'
import * as task from './task'
import * as system from './system'
import * as report from './report'
import * as personal from './personal'

const filters = {
  ...common,
  ...monitor,
  ...resource,
  ...task,
  ...system,
  ...report,
  ...personal
}
export const {
  status,
  isTrue,
  alarmLevel,
  alarmLevelColor,
  resourceTypeMonitor,
  alarmMetric,
  vmStatusFilter,
  openstackServer,
  action,
  image,
  volume,
  vmStatusColor,
  forUse,
  database,
  rolePoolType,
  syncStatus,
  deviceType,
  periodFilter,
  taskExeStatusFilter,
  authenModeFilter,
  chargeMode,
  weekFilter,
  level,
  messageStatusFilter,
  adminStateupFilter,
  templateState,
  templateStateColor,
  flowServiceStatus,
  applyStatus,
  workOrder,
  categoryFilter,
  workOrderColor,
  category,
  templateStatusFilter
} = filters

// 注册全局过滤器
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key])
})
