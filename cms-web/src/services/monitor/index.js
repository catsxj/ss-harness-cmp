import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

// 指标列表
export function getMetrics(params) {
  return request.get('/cms/v1/metrics', {
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
export function getAlarmChart(params) {
  return request.get('/cms/v1/alarms/chart', {
    params
  })
}
// fc主机资源概览
export function getFcHostOverview(id) {
  return request.get(`/cms/v1/hosts/${id}`, {
    params: wrapperParams({ type: 'FUSIONSPHERE' })
  })
}
// 主机详情
export function getHostDetail(id, vendorType) {
  return request.get(`/cms/v1/hosts/${id}`, {
    params: wrapperParams({ type: vendorType })
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
export function getEasystackHost(id) {
  return request.get(`/cms/v1/hosts/${id}`, {
    params: wrapperParams({ type: 'EASYSTACK' })
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
// 云主机列表
export function getVms(params) {
  return request.get('/cms/v1/vms', {
    params: params
  })
}

export function getDataStore(params) {
  return request.get('/cms/v1/datastores', {
    params: params
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
export function getRatio(params) {
  return request.get('/cms/v1/vendors/ratio', {
    params
  })
}
export function ratioOk(params) {
  return request.post('/cms/v1/vendors/ratio', wrapperParams(params))
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
// 运维认证
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
// 安装agent
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
    params: params
  })
}
// 资源利用率TOP5
export function getResTops(params) {
  return request.get('/cms/v1/tops', {
    params: wrapperParams(params)
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
// smart主机列表
export function getSmartHosts(params) {
  return request.get('/cms/v1/smartx/hosts', {
    params: params
  })
}
// 新增通知设置
export function saveAlarmNoticeConfig(params) {
  return request.post('/cms/v1/alarms/saveAlarmNoticeConfig', wrapperParams(params))
}
// 查询通知设置
export function getQueryParentConfig() {
  return request.get('/cms/v1/alarms/queryParentConfig')
}
export function exportFusionHost(params) {
  downloadFile('/cms/v1/fusioncloud/download', params)
}
export function exportVms(params) {
  downloadFile('/cms/v1/vms/download', params)
}
