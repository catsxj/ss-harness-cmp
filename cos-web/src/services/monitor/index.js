import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getConcern(params) {
  return request.get('/cms/v1/follows', {
    params: params
  })
}
export function createConcern(params) {
  return request.post('/cms/v1/follows', wrapperParams(params))
}
export function removeConcern(params) {
  return request.delete('/cms/v1/follows', {
    data: wrapperParams(params)
  })
}
// 阈值
// 列表
export function getThresholds(params) {
  return request.get('/cms/v1/thresholds', {
    params: params
  })
}
// 创建
export function createThresholds(params) {
  return request.post('/cms/v1/thresholds', wrapperParams(params))
}
// 修改
export function modifyThresholds(params) {
  return request.put(`/cms/v1/thresholds/${params.id}`, wrapperParams(params))
}
// 删除
export function removeThresholds(id) {
  return request.delete(`/cms/v1/thresholds/${id}`)
}
// 批量删除
export function batchRemoveThresholds(params) {
  return request.delete('/cms/v1/thresholds', {
    data: wrapperParams(params)
  })
}
// 详情
export function getThresholdsDetail(id) {
  return request.get(`/cms/v1/thresholds/${id}`)
}
// 值类型列表
export function getThresholdsValueTypes() {
  return request.get('/cms/v1/thresholds/valuetypes')
}
// 阈值组
// 列表
export function getThgroups(params) {
  return request.get('/cms/v1/thgroups', {
    params: params
  })
}
// 创建
export function createThgroups(params) {
  return request.post('/cms/v1/thgroups', wrapperParams(params))
}
// 修改
export function modifyThgroups(params) {
  return request.put(`/cms/v1/thgroups/${params.id}`, wrapperParams(params))
}
// 删除
export function removeThgroups(id) {
  return request.delete(`/cms/v1/thgroups/${id}`)
}
// 批量删除
export function batchRemoveThgroups(params) {
  return request.delete('/cms/v1/thgroups', {
    data: wrapperParams(params)
  })
}
// 详情
export function getThgroupsDetail(id) {
  return request.get(`/cms/v1/thgroups/${id}`)
}
// 指标列表
export function getMetrics(params) {
  return request.get('/cms/v1/metrics', {
    params: wrapperParams(params)
  })
}
// 关联阈值组
export function bindThgroups(params) {
  return request.post('/cms/v1/thgroups/binding', wrapperParams(params))
}
// 取消关联阈值组
export function unbindThgroups(params) {
  return request.delete('/cms/v1/thgroups/binding', {
    params: wrapperParams(params)
  })
}
// 设置监控IP
export function setIps(params) {
  return request.post(`/cms/v1/vms/${params.id}/ips`, wrapperParams(params))
}
export function geIps(id) {
  return request.get(`/cms/v1/vms/${id}/ips`)
}
// 分发策略
// 列表
export function getDistributions(params) {
  return request.get('/cms/v1/distributions', {
    params: params
  })
}
// 新增
export function createDistri(params) {
  return request.post('/cms/v1/distributions', wrapperParams(params))
}
// 修改
export function modifyDistri(params) {
  return request.put(`/cms/v1/distributions/${params.id}`, wrapperParams(params))
}
// 删除
export function removeDistri(id) {
  return request.delete(`/cms/v1/distributions/${id}`)
}
// 详情
export function getDistriDetail(id) {
  return request.get(`/cms/v1/distributions/${id}`)
}
// 绑定
export function bindDistri(params) {
  return request.post('/cms/v1/distributions/binding', wrapperParams(params))
}
// 解绑
export function unBindDistri(params) {
  return request.delete('/cms/v1/distributions/binding', {
    params: wrapperParams(params)
  })
}
// 告警模板
const tempUrl = '/cms/v1/templates'
// 列表
export function getTempList(params) {
  return request.get(tempUrl, {
    params: params
  })
}
// 新增
export function createTemp(params) {
  return request.post(tempUrl, wrapperParams(params))
}
// 修改
export function modifyTemp(params) {
  return request.put(`${tempUrl}/${params.id}`, wrapperParams(params))
}
// 删除
export function removeTemp(id) {
  return request.delete(`${tempUrl}/${id}`)
}
// 批量删除
export function batchRemoveTemp(params) {
  return request.delete(tempUrl, {
    data: params
  })
}
// 详情
export function getTempDetail(id) {
  return request.get(`${tempUrl}/${id}`)
}
// 告警列表
export function getAlarmList(params) {
  return request.get('/cms/v1/alarms', {
    params: params
  })
}
export function getAlarmDetail(id) {
  return request.get(`/cms/v1/alarms/${id}`)
}
// 告警确认
export function alarmConfirm(params) {
  return request.patch('/cms/v1/alarms', {
    action: 'confirm',
    ...wrapperParams(params)
  })
}
// 告警解决
export function alarmSolve(params) {
  return request.patch('/cms/v1/alarms', {
    action: 'solve',
    ...wrapperParams(params)
  })
}
// 告警更新
export function metricAlarm(params) {
  return request.put(`/cms/v1/azure/metric/alarms/${params.id}`, wrapperParams(params))
}

export function metricAlarms(params) {
  return request.put('/cms/v1/azure/metric/alarms/batch', wrapperParams(params))
}
// 主机/云主机告警统计饼状图
export function getAlarmPieChart(params) {
  return request.get('/cms/v1/alarms/chart', {
    params: { action: 'pieChart', ...wrapperParams(params) }
  })
}
// 主机/云主机告警统计堆叠图
export function getAlarmBarChart(params) {
  return request.get('/cms/v1/alarms/chart', {
    params: { action: 'barChart', ...wrapperParams(params) }
  })
}
// vcenter主机资源概览
export function getVcHostOverview(id) {
  return request.get(`/cms/v1/hosts/${id}`, {
    params: wrapperParams({ type: 'VMWARE' })
  })
}
// vcenter云主机资源概览
export function getVmOverview(id) {
  return request.get(`/cms/v1/vms/${id}`)
}
// 云主机资源概览仪表盘
export function getVmDashboard(id) {
  return request.get(`/cms/v1/vms/${id}/dashboard`)
}
// 云主机资源概览仪表盘
export function getHostDashboard(params) {
  return request.get('/cms/v1/prometheus', {
    params: wrapperParams(params)
  })
}
// 主机云主机图表
export function getCharts(params) {
  return request.get('/cms/v1/charts', {
    params: wrapperParams(params)
  })
}
// openstack主机详情
export function getOpenstackHost(id) {
  return request.get(`/cms/v1/hosts/${id}`, {
    params: wrapperParams({ type: 'OPENSTACK' })
  })
}
// 主机CPU
export function getHostCpu(id) {
  return request.get(`/cms/v1/hosts/${id}/metrics`, {
    params: wrapperParams({ type: 'cpu' })
  })
}
export function getHostMem(id) {
  return request.get(`/cms/v1/hosts/${id}/metrics`, {
    params: wrapperParams({ type: 'mem' })
  })
}
export function getHostDisk(id) {
  return request.get(`/cms/v1/hosts/${id}/metrics`, {
    params: wrapperParams({ type: 'disk' })
  })
}
// 告警策略主机列表
export function getPolicyHosts(params) {
  return request.get('/cms/v1/hosts', {
    params: params
  })
}
// 告警策略云主机列表
export function getPolicyVms(params) {
  return request.get('/cms/v1/vms', {
    params: params
  })
}
export function getVms(type, params) {
  return request.get(`/cms/v1/${type}/vms`, {
    params: params
  })
}
export function getDataStore(params) {
  return request.get('/cms/v1/datastores', {
    params: params
  })
}
// 主机内存利用率top5
export function getHostMemTops() {
  return request.get('/cms/v1/tops', {
    params: {
      params: 'hostMem'
    }
  })
}
// 主机CPU利用率top5
export function getHostCpuTops() {
  return request.get('/cms/v1/tops', {
    params: {
      params: 'hostCpu'
    }
  })
}
// 云主机CPU利用率top5
export function getVmCpuTops() {
  return request.get('/cms/v1/tops', {
    params: {
      params: 'vmCpu'
    }
  })
}
// 主机CPU利用率top5
export function getVmMemTops() {
  return request.get('/cms/v1/tops', {
    params: {
      params: 'vmMem'
    }
  })
}
// opensatck平台Top5
export function getOpTops(params) {
  return request.get('/cms/v1/tops/vendor', {
    params: wrapperParams(params)
  })
}
// openstack平台详情
export function getOpDetail(params) {
  return request.get('/cms/v1/vendors', {
    params: wrapperParams(params)
  })
}
// openstack平台租户下拉列表
export function getOpNames(params) {
  return request.get('/cms/v1/vendors/names', {
    params: wrapperParams(params)
  })
}
// 开启监控
export function openMonitor(params) {
  return request.patch('/cms/v1/vendors', {
    action: 'open',
    ...wrapperParams(params)
  })
}
// 关闭监控
export function closeMonitor(params) {
  return request.patch('/cms/v1/vendors', {
    action: 'close',
    ...wrapperParams(params)
  })
}
// 安装openstack-exporter
export function installExporter(params) {
  return request.post('/cms/v1/vendors/exporter', params)
}
// openstack-exporter安装详情
export function getExporterDetail(params) {
  return request.get('/cms/v1/vendors/exporter', {
    params: wrapperParams(params)
  })
}
export function getRatio(params) {
  return request.get('/cms/v1/vendors/ratio', {
    params
  })
}
export function ratioOk(params) {
  return request.post('/cms/v1/vendors/ratio', wrapperParams(params))
}
// 主机CPU利用率top5
export function getTops(params) {
  return request.get('/cms/v1/tops', {
    params: wrapperParams(params)
  })
}
// hmc主机分区列表
export function getServers(params) {
  return request.get('/cms/v1/hmc/servers', {
    params: params
  })
}
export function getPartitions(params) {
  return request.get('/cms/v1/hmc/partitions', {
    params: params
  })
}
export function getAuthentications(vendorId) {
  return request.get(`/cms/v1/vendors/${vendorId}/authentications`)
}
export function authenticationsOk(params) {
  return request.post(`/cms/v1/vendors/${params.vendorId}/authentications`, wrapperParams(params))
}
export function getFusionHost(params) {
  return request.get('/cms/v1/fusioncloud/hosts', {
    params: params
  })
}
export function getFusionHostDetail(id) {
  return request.get(`/ims/v1/hosts/${id}`)
}
export function installTaskExporter(params) {
  return request.post('/cop/v1/tasks/install/exporter', wrapperParams(params))
}
export function getOpenstackVm(id) {
  return request.get(`/ims/v1/vms/${id}`)
}

export function getSecurityGroup(params) {
  return request.get(`/ims/v1/vms/${params.id}/sgroups`, {
    params: params
  })
}
export function getUsage(params) {
  return request.get('/cms/v1/prometheus', {
    params: wrapperParams(params)
  })
}
export function getPoolDatas(params) {
  return request.get('/cms/v1/prometheus/filter', {
    params: wrapperParams(params)
  })
}

export function getServices(params) {
  return request.get('/cms/v1/services', {
    params: wrapperParams(params)
  })
}
// 资源利用率TOP5
export function getResTops(params) {
  return request.get('/cms/v1/tops', {
    params: wrapperParams(params)
  })
}
export function getVendorChart(params) {
  return request.get('/cms/v1/alarms/chart', {
    params: {
      action: 'vendorChart',
      ...wrapperParams(params)
    }
  })
}

// IPMI设置
export function getHosts(id) {
  return request.get(`/cms/v1/hosts/ipmi/${id}`)
}

export function patchHosts(url, params) {
  return request.patch(url, { ...wrapperParams(params) })
}
// 数据源配置
export function configDataSource(vendorId, params) {
  return request.post(`/cms/v1/vendors/${vendorId}/monitor`, wrapperParams(params))
}
export function getfilters(params) {
  return request.get('/cms/v1/prometheus/filter', {
    params: wrapperParams(params)
  })
}
// 告警策略
export function getRuleGroup(params) {
  return request.get('/cms/v1/rulegroups', {
    params: wrapperParams(params)
  })
}
export function createRuleGroup(params) {
  return request.post('/cms/v1/rulegroups', wrapperParams(params))
}
export function modifyRuleGroup(params) {
  return request.put(`/cms/v1/rulegroups/${params.id}`, wrapperParams(params))
}
export function removeRuleGroup(id) {
  return request.delete(`/cms/v1/rulegroups/${id}`)
}
export function batchRemoveRuleGroup(params) {
  return request.delete('/cms/v1/rulegroups', {
    data: wrapperParams(params)
  })
}
export function getRuleGroupDetail(id) {
  return request.get(`/cms/v1/rulegroups/${id}`)
}
export function ruleGroupEnable(params) {
  return request.patch('/cms/v1/rulegroups/enable', { ...wrapperParams(params) })
}
export function rulegroupsBinding(params) {
  return request.patch('/cms/v1/rulegroups/binding', { ...wrapperParams(params) })
}
export function rulegroupsUnBinding(params) {
  return request.delete('/cms/v1/rulegroups/binding', {
    data: wrapperParams(params)
  })
}
export function getRuleGroupBind(id) {
  return request.get(`/cms/v1/rulegroups/${id}/resources`)
}
export function modifyAlarmStatus(params) {
  return request.post('/cms/v1/alarmstatus', wrapperParams(params))
}
export function deleteAlarmStatus(params) {
  return request.delete('/cms/v1/alarmstatus', {
    data: wrapperParams(params)
  })
}
export function getVolumeByType(params, type, projectName) {
  return request.get(`/dms/v1/vendors/type/${type}/${projectName}/volumes`, {
    params
  })
}
