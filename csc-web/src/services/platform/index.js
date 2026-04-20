import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

// volume
const volumeUrl = '/ims/v1/volumes'
export function getVolume(params, url) {
  return request.get(url || volumeUrl, {
    params
  })
}

// 公有云账单
export function billList(params) {
  return request.get('/rms/v1/pc/bills', { params })
}

export function exportBill(id) {
  downloadFile(`/rms/v1/pc/bills/${id}/download`)
}

export function getBillInstance(params) {
  return request.patch(`/rms/v1/pc/bills/${params.propertyId}/columns`, wrapperParams(params))
}

export function getBillingDetails(params, id) {
  return request.get(`/rms/v1/pc/bills/${id}`, { params })
}

export function removeBill(id) {
  return request.delete(`/rms/v1/pc/bills/${id}`)
}

export function mergeBill(params) {
  return request.post('/rms/v1/pc/bills/combine', wrapperParams(params))
}

// 云主机
export function statementList(params) {
  return request.get('/rms/v1/reports/vms', { params })
}

export function createVolume(params, url) {
  return request.post(url || volumeUrl, wrapperParams(params))
}

export function modifyVolume(params) {
  return request.put(`${volumeUrl}/${params.id}`, wrapperParams(params))
}

export function removeVolume(id) {
  return request.delete(`${volumeUrl}/${id}`)
}

export function detailVolume(id) {
  return request.get(`${volumeUrl}/${id}`)
}

export function patchVolume(action, params) {
  return request.patch(`${volumeUrl}/${params.id ? params.id : params.resId}`, {
    action: action,
    ...wrapperParams(params)
  })
}

export function conditionVoleme(obj) {
  const params = { condition: JSON.stringify(obj) }
  return request.get(`${volumeUrl}/condition`, { params })
}

export function removeVolumes(params) {
  return request.delete(`${volumeUrl}`, { data: params })
}

export function getVolumeVms(params) {
  return request.get(`${volumeUrl}/${params.id}/vms`, {
    params: wrapperParams(params)
  })
}

const dmsVolumeUrl = '/dms/v1/storages/volumes'
export function getDmsVolume(params) {
  return request.get(dmsVolumeUrl, {
    params
  })
}

export function createDmsVolume(params) {
  return request.post(dmsVolumeUrl, wrapperParams(params))
}

export function modifyDmsVolume(params) {
  return request.put(`${dmsVolumeUrl}/${params.id}`, wrapperParams(params))
}

export function removeDmsVolume(id) {
  return request.delete(`${dmsVolumeUrl}/${id}`)
}

export function detailDmsVolume(id) {
  return request.get(`${dmsVolumeUrl}/${id}`)
}

// vpc
const vpcUrl = '/ims/v1/vpcs'
export function getVpc(params) {
  return request.get(vpcUrl, { params })
}

export function createVpc(params) {
  return request.post(vpcUrl, wrapperParams(params))
}

export function modifyVpc(params) {
  return request.put(`${vpcUrl}/${params.id}`, wrapperParams(params))
}

export function removeVpc(id) {
  return request.delete(`${vpcUrl}/${id}`)
}

export function removeVpcs(params) {
  return request.delete(`${vpcUrl}`, { params: wrapperParams(params) })
}

export function detailVpc(id) {
  return request.get(`${vpcUrl}/${id}`)
}
export function createVpcDdos(params) {
  return request.post(`${vpcUrl}/${params.id}/ddos`, params)
}

export function removeVpcDdos(params) {
  return request.delete(`${vpcUrl}/${params.id}/ddos`)
}

// 区域
const regionZoneUrl = '/ims/v1/regions'
export function getRegion(params) {
  return request.get(regionZoneUrl, { params })
}
export function getRegionCondition(params) {
  return request.get(`${regionZoneUrl}/condition`, { params: { condition: JSON.stringify(params) } })
}

export function getZone(params) {
  return request.get(`${regionZoneUrl}/zones`, {
    params: wrapperParams(params)
  })
}

export function conditionRegion(params) {
  return request.get(regionZoneUrl, { params })
}
// 同步记录
const syncLogUrl = '/cos/v1/vendors/records'
export function getLogSync(params) {
  return request.get(syncLogUrl, { params })
}

// 字典
const dictUrl = '/sms/v1/dictionaries'
export function getDict(params) {
  return request.get(dictUrl, { params })
}

export function createDict(params) {
  return request.post(dictUrl, wrapperParams(params))
}

export function modifyDict(params) {
  return request.put(`${dictUrl}/${params.id}`, wrapperParams(params))
}

export function removeDict(id) {
  return request.delete(`${dictUrl}/${id}`)
}

export function detailDict(id) {
  return request.get(`${dictUrl}/${id}`)
}

export function getDictChildren(params) {
  return request.get(`${dictUrl}/children`, { params })
}

export function getDictChildrenTree(params) {
  return request.get(`${dictUrl}/children/tree`, {
    params: wrapperParams(params)
  })
}

// 镜像
const imageUrl = '/ims/v1/images'
export function getImage(params) {
  return request.get(imageUrl, {
    params
  })
}

export function createImage(params) {
  return request.post(imageUrl, wrapperParams(params))
}

export function modifyImage(params) {
  return request.put(`${imageUrl}/${params.id}`, wrapperParams(params))
}

export function removeImage(id) {
  return request.delete(`${imageUrl}/${id}`)
}

export function removeTcImage(id, params) {
  return request.delete(`${imageUrl}/${id}`, {
    params: JSON.stringify(params)
  })
}
export function getVmImages(id, params) {
  return request.get(`${vmUrl}/${id}/images`, {
    params
  })
}

export function detailImage(id) {
  return request.get(`${imageUrl}/${id}`)
}

export function conditionImage(obj) {
  const params = { condition: JSON.stringify(obj) }
  return request.get(`${imageUrl}/condition`, { params })
}

export function removeImages(params) {
  return request.delete(imageUrl, { params: wrapperParams(params) })
}

// 批量更新  复制镜像
export function allModifyImage(params) {
  return request.put(imageUrl, wrapperParams(params))
}

// 更新镜像到期时间
export function updateImageTime(params) {
  return request.patch(`${imageUrl}/${params.resId}`, {
    action: 'updateExpriedTime',
    ...wrapperParams(params)
  })
}

// 批量删除 根据某种需求删除镜像
export function removeAllImage(params) {
  return request.delete(imageUrl, wrapperParams(params))
}

// 镜像共享
export function shareImage(params) {
  return request.patch(`${imageUrl}/${params.imageId}`, {
    action: 'shareImage',
    ...wrapperParams(params)
  })
}

export function shareSyncImage(params) {
  return request.patch(`${imageUrl}/${params.imageId}`, {
    action: 'syncImages',
    ...wrapperParams(params)
  })
}

export function patchImage(action, params) {
  return request.patch(`${imageUrl}/${params.id}`, {
    action: action,
    ...wrapperParams(params)
  })
}

// 查询镜像使用的存储卷
export function volumeImage(id) {
  return request.get(`${imageUrl}/${id}/volumes`)
}

const rspUrl = '/ims/v1/rsps'
export function getSchedulerPolicy(params) {
  return request.get(rspUrl, {
    params
  })
}

export function createSchedulerPolicy(params) {
  return request.post(rspUrl, wrapperParams(params))
}

export function modifySchedulerPolicy(params) {
  return request.put(`${rspUrl}/${params.id}`, wrapperParams(params))
}

export function removeSchedulerPolicy(id) {
  return request.delete(`${rspUrl}/${id}`)
}

export function detailSchedulerPolicy(id) {
  return request.get(`${rspUrl}/${id}`)
}

export function bindCluster(params) {
  return request.patch(`${rspUrl}/${params.id}/clusters`, wrapperParams(params))
}

export function setPolicy(params) {
  return request.patch(`/ims/v1/pool/groups/${params.id}`, params)
}

// 弹性伸缩
const autoUrl = '/ims/v1/autoscaling'
export function getAuto(params) {
  return request.get(autoUrl, {
    params
  })
}

export function createAuto(params) {
  return request.post(autoUrl, wrapperParams(params))
}

export function modifyAuto(params) {
  return request.put(`${autoUrl}/${params.id}`, wrapperParams(params))
}

export function removeAuto(id) {
  return request.delete(`${autoUrl}/${id}`)
}

export function removeTcAuto(id, params) {
  return request.delete(`${autoUrl}/${id}`, { params: JSON.stringify(params) })
}

export function detailAuto(id) {
  return request.get(`${autoUrl}/${id}`)
}

export function conditionAuto(params) {
  return request.get(`${autoUrl}/condition`, { params })
}

export function removeAutos(params) {
  return request.delete(autoUrl, { params: wrapperParams(params) })
}

export function patchAuto(params) {
  return request.patch(`${autoUrl}/${params.id}`, wrapperParams(params))
}

// 伸缩配置
const autoSettingUrl = '/ims/v1/autoscaling/config'
export function getAutoConfig(params) {
  return request.get(autoSettingUrl, {
    params
  })
}

export function createAutoConfig(params) {
  return request.post(autoSettingUrl, wrapperParams(params))
}

export function modifyAutoConfig(params) {
  return request.put(`${autoSettingUrl}/${params.id}`, wrapperParams(params))
}

export function removeAutoConfig(id) {
  return request.delete(`${autoSettingUrl}/${id}`)
}

export function removeTcAutoConfig(id, params) {
  return request.delete(`${autoSettingUrl}/${id}`, {
    params: JSON.stringify(params)
  })
}

export function detailAutoConfig(id) {
  return request.get(`${autoSettingUrl}/${id}`)
}

export function conditionAutoConfig(params) {
  return request.get(`${autoSettingUrl}/condition`, { params })
}

export function removeAutoConfigs(params) {
  return request.delete(autoSettingUrl, { params: wrapperParams(params) })
}

// 报警任务
const alarmTaskUrl = '/ims/v1/autoscaling/alarmtask'
export function getAlarmTask(params) {
  return request.get(alarmTaskUrl, {
    params
  })
}

export function createAlarmTask(params) {
  return request.post(alarmTaskUrl, wrapperParams(params))
}

export function modifyAlarmTask(params) {
  return request.put(`${alarmTaskUrl}/${params.id}`, wrapperParams(params))
}

export function removeAlarmTask(id) {
  return request.delete(`${alarmTaskUrl}/${id}`)
}

export function removeTcAlarmTask(id, params) {
  return request.delete(`${alarmTaskUrl}/${id}`, {
    params: JSON.stringify(params)
  })
}

export function detailAlarmTask(id) {
  return request.get(`${alarmTaskUrl}/${id}`)
}

export function conditionAlarmTask(params) {
  return request.get(`${alarmTaskUrl}/condition`, { params })
}

export function removeAlarmTasks(params) {
  return request.delete(alarmTaskUrl, { params: wrapperParams(params) })
}

// 定时任务
const timedTaskUrl = '/ims/v1/autoscaling/timedtask'
export function getTimedTask(params) {
  return request.get(timedTaskUrl, {
    params
  })
}

export function createTimedTask(params) {
  return request.post(timedTaskUrl, wrapperParams(params))
}

export function modifyTimedTask(params) {
  return request.put(`${timedTaskUrl}/${params.id}`, wrapperParams(params))
}

export function removeTimedTask(id) {
  return request.delete(`${timedTaskUrl}/${id}`)
}

export function removeTcTimedTask(id, params) {
  return request.delete(`${timedTaskUrl}/${id}`, {
    params: JSON.stringify(params)
  })
}

export function detailTimedTask(id) {
  return request.get(`${timedTaskUrl}/${id}`)
}

export function conditionTimedTask(params) {
  return request.get(`${timedTaskUrl}/condition`, { params })
}

export function removeTimedTasks(params) {
  return request.delete(timedTaskUrl, { params: wrapperParams(params) })
}

// 安全组
const sgroupsUrl = '/ims/v1/sgroups'
export function getGroup(params) {
  return request.get(sgroupsUrl, {
    params
  })
}

export function createGroup(params) {
  return request.post(sgroupsUrl, wrapperParams(params))
}

export function modifyGroup(params) {
  return request.put(`${sgroupsUrl}/${params.id}`, wrapperParams(params))
}

export function removeGroup(id) {
  return request.delete(`${sgroupsUrl}/${id}`)
}

export function detailGroup(id) {
  return request.get(`${sgroupsUrl}/${id}`)
}

export function removeGroups(params) {
  return request.delete(sgroupsUrl, { data: params })
}

export function patchGroups(action, params) {
  return request.patch(`${sgroupsUrl}/${params.id}`, {
    action: action,
    ...wrapperParams(params)
  })
}

// 安全组规则
const sgroupsRuleUrl = '/ims/v1/sgroups/rules'
export function getGroupRule(params) {
  return request.get(sgroupsRuleUrl, {
    params
  })
}

export function createGroupRule(params) {
  return request.post(sgroupsRuleUrl, wrapperParams(params))
}

export function removeGroupRule(id) {
  return request.delete(`${sgroupsRuleUrl}/${id}`)
}

export function detailGroupRule(id) {
  return request.get(`${sgroupsRuleUrl}/${id}`)
}

export function removeGroupRules(params) {
  return request.delete(sgroupsRuleUrl, { params: wrapperParams(params) })
}

// spec
const specUrl = '/ims/v1/specs'
export function getSpec(params) {
  return request.get(specUrl, {
    params
  })
}

export function createSpec(params) {
  return request.post(specUrl, wrapperParams(params))
}

export function modifySpec(params) {
  return request.put(`${specUrl}/${params.id}`, wrapperParams(params))
}

export function removeSpec(id) {
  return request.delete(`${specUrl}/${id}`)
}

export function detailSpec(id) {
  return request.get(`${specUrl}/${id}`)
}

// 子网
const subnetUrl = '/ims/v1/subnets'
export function getSubnet(params) {
  return request.get(subnetUrl, {
    params
  })
}

export function createSubnet(params) {
  return request.post(subnetUrl, wrapperParams(params))
}

export function modifySubnet(params) {
  return request.put(`${subnetUrl}/${params.id}`, wrapperParams(params))
}

export function removeSubnet(id) {
  return request.delete(`${subnetUrl}/${id}`)
}

export function detailSubnet(id) {
  return request.get(`${subnetUrl}/${id}`)
}

export function conditionSubnet(params) {
  return request.get(`${subnetUrl}/condition`, { params })
}

// 查询路由连接的子网
export function getRouterSubnet(params) {
  return request.get('/ims/v1/routers/subnets', { params })
}

export function removeSubnets(params) {
  return request.delete(subnetUrl, { data: params })
}

// vdc
const vdcUrl = '/ims/v1/vdcs'
export function getVdc(params) {
  return request.get(vdcUrl, {
    params
  })
}

export function createVdc(params) {
  return request.post(vdcUrl, wrapperParams(params))
}

export function modifyVdc(params) {
  return request.put(`${vdcUrl}/${params.id}`, wrapperParams(params))
}

export function removeVdc(id) {
  return request.delete(`${vdcUrl}/${id}`)
}

export function detailVdc(id) {
  return request.get(`${vdcUrl}/${id}`)
}

export function getVdcHost(params) {
  return request.get(`${vdcUrl}/${params.id}/hosts`, {
    params: wrapperParams(params)
  })
}

// 网卡
const networkcardUrl = '/ims/v1/nics'
export function getNetworkcard(params) {
  return request.get(networkcardUrl, {
    params
  })
}

export function createNetworkcard(params) {
  return request.post(networkcardUrl, wrapperParams(params))
}

export function modifyNetworkcard(params) {
  return request.put(`${networkcardUrl}/${params.id}`, wrapperParams(params))
}

export function removeNetworkcard(id) {
  return request.delete(`${networkcardUrl}/${id}`)
}

export function detailNetworkcard(id) {
  return request.get(`${networkcardUrl}/${id}`)
}

// 挂载
export function attachNetworkcard(params) {
  return request.patch(`${networkcardUrl}/${params.id}/vms`, wrapperParams(params))
}

export function attachDeleteNetworkcard(params) {
  return request.delete(`${networkcardUrl}/${params.id}/vms`, {
    params: wrapperParams(params)
  })
}

export function getUnbindCard(id) {
  return request.get(`${networkcardUrl}/unBandList/${id}`)
}

// 命名规则
const nameRuleUrl = '/sms/v1/namings'
export function getNameRule(params) {
  return request.get(nameRuleUrl, {
    params
  })
}

export function createNameRule(params) {
  return request.post(nameRuleUrl, wrapperParams(params))
}

export function modifyNameRule(params) {
  return request.put(`${nameRuleUrl}/${params.id}`, wrapperParams(params))
}

export function removeNameRule(id) {
  return request.delete(`${nameRuleUrl}/${id}`)
}

export function detailNameRule(id) {
  return request.get(`${nameRuleUrl}/${id}`)
}

// 标签
const labelUrl = '/ims/v1/tags'
export function getLabel(params) {
  return request.get(labelUrl, {
    params
  })
}

export function createLabel(params) {
  return request.post(labelUrl, wrapperParams(params))
}

export function modifyLabel(params) {
  return request.put(`${labelUrl}/${params.id}`, wrapperParams(params))
}

export function removeLabel(id) {
  return request.delete(`${labelUrl}/${id}`)
}

export function detailLabel(id) {
  return request.get(`${labelUrl}/${id}`)
}

// 密钥
const keyUrl = '/ims/v1/keypairs'
export function getKey(params) {
  return request.get(keyUrl, {
    params
  })
}

export function createKey(params) {
  return request.post(keyUrl, wrapperParams(params))
}

export function modifyKey(params) {
  return request.put(`${keyUrl}/${params.id}`, wrapperParams(params))
}

export function removeKey(id) {
  return request.delete(`${keyUrl}/${id}`)
}

export function detailKey(id) {
  return request.get(`${keyUrl}/${id}`)
}

export function existKey(params) {
  return request.get(keyUrl, { params })
}

export function removeKeys(params) {
  return request.delete(keyUrl, { data: params })
}

export function keyBindVm(params) {
  return request.patch(`${keyUrl}/${params.keypairId}`, wrapperParams(params))
}

// 平台
const cloudVendorUrl = '/ims/v1/vendors'
export function getCloudVendor(params, url) {
  return request.get(`${url || cloudVendorUrl}`, {
    params
  })
}

export function getOverviewCloudVendor(params) {
  return request.get('/sms/v1/vendors', {
    params
  })
}

export function createCloudVendor(params, url) {
  return request.post(`${url || cloudVendorUrl}`, wrapperParams(params))
}

export function modifyCloudVendor(params, url) {
  return request.put(`${url || cloudVendorUrl}/${params.id}`, wrapperParams(params))
}

export function removeCloudVendor(id, url) {
  return request.delete(`${url || cloudVendorUrl}/${id}`)
}

export function detailCloudVendor(id, url) {
  return request.get(`${url || cloudVendorUrl}/${id}`)
}

export function syncCloudVendor(id, url) {
  return request.post(`${url || cloudVendorUrl}/${id}/sync`)
}

export function getVendorHosts(params) {
  return request.get(`/ims/v1/vendors/${params.id}/hosts`, {
    params: wrapperParams(params)
  })
}

export function getDictionaries(params) {
  return request.get('/sms/v1/dictionaries/children', {
    params
  })
}

export function getDictionariesTree(params) {
  return request.get('/sms/v1/dictionaries/children/tree', {
    params
  })
}

export function getVendorGroup(params) {
  return request.get('/soc/v1/vendor/group', {
    params
  })
}

export function patchCloudVendor(params, url) {
  return request.patch(`${url || cloudVendorUrl}/${params.id}/password`, { ...wrapperParams(params) })
}

// 平台告警阈值
export function alarmCloudVendor(params) {
  return request.post(`${cloudVendorUrl}/${params.target}/alarms`, wrapperParams(params))
}

export function getAlarmCloudVendor(params) {
  return request.get(`${cloudVendorUrl}/${params.id}/alarms`, {
    params: wrapperParams(params)
  })
}

export function capacityAlarmCloudVendor(params) {
  return request.get(`${cloudVendorUrl}/${params.id}/capacity`, {
    params: wrapperParams(params)
  })
}

export function conditionCloudVendor(params) {
  return request.get(`${cloudVendorUrl}/condition`, { params })
}

export function outAlarms(params) {
  return request.get(cloudVendorUrl, wrapperParams(params))
}

export function removeAlarms(params) {
  return request.delete(cloudVendorUrl, { params: wrapperParams(params) })
}

// 集群
const clutersUrl = '/ims/v1/clusters'
export function getCluters(params) {
  return request.get(clutersUrl, {
    params
  })
}

export function createCluters(params) {
  return request.post(clutersUrl, wrapperParams(params))
}

export function modifyCluters(params) {
  return request.put(`${clutersUrl}/${params.id}`, wrapperParams(params))
}

export function removeCluters(id) {
  return request.delete(`${clutersUrl}/${id}`)
}

export function detailCluters(id) {
  return request.get(`${clutersUrl}/${id}`)
}

export function getCluterHosts(params) {
  return request.get(`${clutersUrl}/${params.clusterId}/hosts`, {
    params: wrapperParams(params)
  })
}

export function getCluterTendency(params) {
  return request.get(`${clutersUrl}/${params.id}/tendency`, {
    params
  })
}

// 集群移入移除主机
export function cluterBindVm(params) {
  return request.post(`${clutersUrl}/${params.id ? params.id : params.clusterId}/hosts`, wrapperParams(params))
}

export function cluterUnBindVm(params) {
  return request.delete(`${clutersUrl}/${params.id ? params.id : params.clusterId}/hosts`, { params: wrapperParams(params) })
}

export function alarmCluter(params) {
  return request.post(`${clutersUrl}/${params.target}/thresholds`, wrapperParams(params))
}

export function getAlarmCluter(params) {
  return request.get(`${clutersUrl}/${params.id}/thresholds`, {
    params: wrapperParams(params)
  })
}

// 集群节点
export function getClutersNodes(params) {
  return request.get(`${clutersUrl}/hosts`, { params })
}

export function getClutersNodesDetail(id) {
  return request.get(`${clutersUrl}/hosts/${id}`)
}

// 数据中心
const dcUrl = '/ims/v1/dcs'
export function getDc(params) {
  return request.get(dcUrl, {
    params
  })
}

export function createDc(params) {
  return request.post(dcUrl, wrapperParams(params))
}

export function modifyDc(params) {
  return request.put(`${dcUrl}/${params.id}`, wrapperParams(params))
}

export function removeDc(id) {
  return request.delete(`${dcUrl}/${id}`)
}

export function detailDc(id) {
  return request.get(`${dcUrl}/${id}`)
}

// 硬盘类型
const diskTypeUrl = '/ims/v1/volume/types'
export function getDiskType(params) {
  return request.get(diskTypeUrl, {
    params
  })
}

export function createDiskType(params) {
  return request.post(diskTypeUrl, wrapperParams(params))
}

export function modifyDiskType(params) {
  return request.put(`${diskTypeUrl}/${params.id}`, wrapperParams(params))
}

export function removeDiskType(id) {
  return request.delete(`${diskTypeUrl}/${id}`)
}

export function detailDiskType(id) {
  return request.get(`${diskTypeUrl}/${id}`)
}

// 数据存储
const datastoresUrl = '/ims/v1/datastores'
export function getDatastores(params) {
  return request.get(datastoresUrl, {
    params
  })
}

export function createDatastores(params) {
  return request.post(datastoresUrl, wrapperParams(params))
}

export function modifyDatastores(params) {
  return request.put(`${datastoresUrl}/${params.id}`, wrapperParams(params))
}

export function removeDatastores(id) {
  return request.delete(`${datastoresUrl}/${id}`)
}

export function detailDatastores(id) {
  return request.get(`${datastoresUrl}/${id}`)
}

export function getDatastoresVm(params) {
  return request.get(`${datastoresUrl}/${params.hostId}/hosts`, {
    params: wrapperParams(params)
  })
}

export function getDatastoresServer(params) {
  return request.get(`${datastoresUrl}/${params.id}/vms`, { params })
}

export function getDatastoresHosts(params) {
  return request.get(`${datastoresUrl}/${params.id}/hosts`, { params })
}

export function getDatastoresFiles(params) {
  return request.post(`${datastoresUrl}/${params.id}/files`, params)
}

export function getDatastoresHostsDelete(params) {
  return request.delete(`${datastoresUrl}/${params.id}/hosts`, { params })
}

export function conditionDatastore(params) {
  return request.get(`${datastoresUrl}/condition`, { params })
}

export function putDatastoresTags(params) {
  return request.put('/ims/v1/datastores/tags', wrapperParams(params))
}
export function getPolicy(params) {
  return request.get(`${datastoresUrl}/1/policies`, { params })
}
export function getNewPolicy(id) {
  return request.get(`${datastoresUrl}/${id}/policies`)
}

// 所属环境
const environmentsUrl = '/sms/v1/environments'
export function getEnvironments(params) {
  return request.get(environmentsUrl, {
    params
  })
}

export function createEnvironments(params) {
  return request.post(environmentsUrl, wrapperParams(params))
}

export function modifyEnvironments(params) {
  return request.put(`${environmentsUrl}/${params.id}`, wrapperParams(params))
}

export function removeEnvironments(id) {
  return request.delete(`${environmentsUrl}/${id}`)
}

export function detailEnvironments(id) {
  return request.get(`${environmentsUrl}/${id}`)
}

// 防火墙
const firewallUrl = '/ims/v1/firewalls'
export function getFirewall(params) {
  return request.get(firewallUrl, {
    params
  })
}

export function createFirewall(params) {
  return request.post(firewallUrl, wrapperParams(params))
}

export function modifyFirewall(params) {
  return request.put(`${firewallUrl}/${params.id}`, wrapperParams(params))
}

export function removeFirewall(id) {
  return request.delete(`${firewallUrl}/${id}`)
}

export function detailFirewall(id) {
  return request.get(`${firewallUrl}/${id}`)
}

export function removeFirewalls(params) {
  return request.delete(firewallUrl, { params: wrapperParams(params) })
}

// 防火墙路由
export function firewallRouter(params) {
  return request.post(`${firewallUrl}/${params.id}/routers`, wrapperParams(params))
}

export function getFirewallRouter(params) {
  return request.get(`${firewallUrl}/${params.id}/routers`, { params })
}

// 计算节点
const nodelUrl = '/ims/v1/clusters/nodes'
export function getNode(params) {
  return request.get(nodelUrl, {
    params
  })
}

export function createNode(params) {
  return request.post(nodelUrl, wrapperParams(params))
}

export function modifyNode(params) {
  return request.put(`${nodelUrl}/${params.id}`, wrapperParams(params))
}

export function removeNode(id) {
  return request.delete(`${nodelUrl}/${id}`)
}

export function detailNode(id) {
  return request.get(`${nodelUrl}/${id}`)
}

export function removeNodes(params) {
  return request.delete(nodelUrl, { params: wrapperParams(params) })
}

export function conditionNode(params) {
  return request.get(`${nodelUrl}/condition`, { params })
}

// 云堆栈
const stackUrl = '/ims/v1/heat/stacks'
export function getStack(params) {
  return request.get(stackUrl, {
    params
  })
}

export function createStack(params) {
  return request.post(stackUrl, wrapperParams(params))
}

export function modifyStack(params) {
  return request.put(`${stackUrl}/${params.id}`, wrapperParams(params))
}

export function removeStack(id) {
  return request.delete(`${stackUrl}/${id}`)
}

export function detailStack(id) {
  return request.get(`${stackUrl}/${id}`)
}

export function removeStacks(params) {
  return request.delete(stackUrl, { params: wrapperParams(params) })
}

export function conditionStack(params) {
  return request.get(`${stackUrl}/condition`, { params })
}

export function patchStack(action, params) {
  return request.patch(`${stackUrl}/${params.id}`, {
    action: action
  })
}

export function stackEvent(params) {
  return request.get(`${stackUrl}/event`, { params })
}

// 云堆栈版本
const stackVersionUrl = '/ims/v1/heat/stacks/versions'
export function getStackVersion(params) {
  return request.get(stackVersionUrl, {
    params
  })
}

export function createStackVersion(params) {
  return request.post(stackVersionUrl, wrapperParams(params))
}

export function modifyStackVersion(params) {
  return request.put(`${stackVersionUrl}/${params.id}`, wrapperParams(params))
}

export function removeStackVersion(id) {
  return request.delete(`${stackVersionUrl}/${id}`)
}

export function detailStackVersion(id) {
  return request.get(`${stackVersionUrl}/${id}`)
}

export function removeStackVersions(params) {
  return request.delete(stackVersionUrl, { params: wrapperParams(params) })
}

export function conditionStackVersion(params) {
  return request.get(`${stackVersionUrl}/condition`, { params })
}

// 防火墙规则
const firewalRulelUrl = '/ims/v1/firewalls/rules'
export function getFirewallRule(params) {
  return request.get(firewalRulelUrl, {
    params
  })
}

export function createFirewallRule(params) {
  return request.post(firewalRulelUrl, wrapperParams(params))
}

export function modifyFirewallRule(params) {
  return request.put(`${firewalRulelUrl}/${params.id}`, wrapperParams(params))
}

export function removeFirewallRule(id) {
  return request.delete(`${firewalRulelUrl}/${id}`)
}

export function detailFirewallRule(id) {
  return request.get(`${firewalRulelUrl}/${id}`)
}

export function removeFirewallRules(params) {
  return request.delete(firewalRulelUrl, { params: wrapperParams(params) })
}

export function conditionFirewallRule(params) {
  return request.get(`${firewalPolicyUrl}/condition`, { params })
}

// 防火墙策略
const firewalPolicyUrl = '/ims/v1/firewalls/policies'
export function getFirewallPolicy(params) {
  return request.get(firewalPolicyUrl, {
    params
  })
}

export function createFirewallPolicy(params) {
  return request.post(firewalPolicyUrl, wrapperParams(params))
}

export function modifyFirewallPolicy(params) {
  return request.put(`${firewalPolicyUrl}/${params.id}`, wrapperParams(params))
}

export function removeFirewallPolicy(id) {
  return request.delete(`${firewalPolicyUrl}/${id}`)
}

export function detailFirewallPolicy(id) {
  return request.get(`${firewalPolicyUrl}/${id}`)
}

export function removeFirewallPolicys(params) {
  return request.delete(firewalPolicyUrl, { params: wrapperParams(params) })
}

export function conditionFirewallPolicy(params) {
  return request.get(`${firewalPolicyUrl}/condition`, { params })
}

export function policyBindRule(params) {
  return request.get(`${firewalPolicyUrl}/${params.policyId}/rules`, {
    params
  })
}

// 插入移除规则
export function policyRule(params) {
  return request.post(`${firewalPolicyUrl}/${params.id}/rules`, wrapperParams(params))
}

export function removePolicyRule(params) {
  return request.delete(`${firewalPolicyUrl}/${params.id}/rules`, {
    data: wrapperParams(params)
  })
}

// QoS策略
const qosPolicyUrl = 'ims/v1/qos/policys'
export function getQosPolicy(params) {
  return request.get(qosPolicyUrl, {
    params
  })
}

export function createQosPolicy(params) {
  return request.post(qosPolicyUrl, wrapperParams(params))
}

export function modifyQosPolicy(params) {
  return request.put(`${qosPolicyUrl}/${params.id}`, wrapperParams(params))
}

export function removeQosPolicy(id) {
  return request.delete(`${qosPolicyUrl}/${id}`)
}

export function detailQosPolicy(id) {
  return request.get(`${qosPolicyUrl}/${id}`)
}

export function removeQosPolicys(params) {
  return request.delete(qosPolicyUrl, { params: wrapperParams(params) })
}

export function conditionQosPolicy(params) {
  return request.get(`${qosPolicyUrl}/condition`, { params })
}

// QoS规则
const qosRuleUrl = 'ims/v1/qos/rules'
export function getQosRule(params) {
  return request.get(qosRuleUrl, {
    params
  })
}

export function createQosRule(params) {
  return request.post(qosRuleUrl, wrapperParams(params))
}

export function modifyQosRule(params) {
  return request.put(`${qosRuleUrl}/${params.id}`, wrapperParams(params))
}

export function removeQosRule(id) {
  return request.delete(`${qosRuleUrl}/${id}`)
}

export function detailQosRule(id) {
  return request.get(`${qosRuleUrl}/${id}`)
}

export function removeQosRules(params) {
  return request.delete(qosRuleUrl, { params: wrapperParams(params) })
}

export function conditionQosRule(params) {
  return request.get(`${qosRuleUrl}/condition`, { params })
}

// 规格
const flavorUrl = '/ims/v1/flavors'
export function getFlavor(params) {
  return request.get(flavorUrl, {
    params
  })
}

export function createFlavor(params) {
  return request.post(flavorUrl, wrapperParams(params))
}

export function modifyFlavor(params) {
  return request.put(`${flavorUrl}/${params.id}`, wrapperParams(params))
}

export function removeFlavor(id) {
  return request.delete(`${flavorUrl}/${id}`)
}

export function detailFlavor(id) {
  return request.get(`${flavorUrl}/${id}`)
}

export function removeFlavors(params) {
  return request.delete(flavorUrl, { params: wrapperParams(params) })
}

export function conditionFlavor(params) {
  return request.get(`${flavorUrl}/condition`, { params })
}

export function modifyFlavors(params) {
  return request.post(`${flavorUrl}/status/batch`, wrapperParams(params))
}

export function modifyAzureFlavor(params) {
  return request.put(`${flavorUrl}/${params.id}/status`, wrapperParams(params))
}

// 云硬盘备份
const backUpUrl = '/ims/v1/backup/vaults'
export function getBackUp(params) {
  return request.get(backUpUrl, {
    params
  })
}

export function createBackUp(params) {
  return request.post(backUpUrl, wrapperParams(params))
}

export function modifyBackUp(params) {
  return request.put(`${backUpUrl}/${params.id}`, wrapperParams(params))
}

export function removeBackUp(id) {
  return request.delete(`${backUpUrl}/${id}`)
}

export function detailBackUp(id) {
  return request.get(`${backUpUrl}/${id}`)
}

export function conditionBackUp(params) {
  return request.get(`${backUpUrl}/condition`, { params })
}

export function getBackUps(params) {
  return request.get('/ims/v1/backups', {
    params
  })
}

export function detailBackUps(id) {
  return request.get(`/ims/v1/backups/${id}`)
}

export function removeBackUps(id) {
  return request.delete(`/ims/v1/backups/${id}`)
}

export function restoreBackUp(params) {
  return request.post('/ims/v1/backups/restore', wrapperParams(params))
}

export function bindBackUp(params) {
  return request.post(`${backUpUrl}/addResources`, wrapperParams(params))
}

export function backUp(params) {
  return request.post(`${backUpUrl}/backup`, wrapperParams(params))
}

// 浮动IP
const floatIpUrl = '/ims/v1/floatips'
export function getFloatIp(params) {
  return request.get(floatIpUrl, {
    params
  })
}

export function createFloatIp(params) {
  return request.post(floatIpUrl, wrapperParams(params))
}

export function modifyFloatIp(params) {
  return request.put(`${floatIpUrl}/${params.id}`, wrapperParams(params))
}

export function removeFloatIp(id) {
  return request.delete(`${floatIpUrl}/${id}`)
}

export function detailFloatIp(id) {
  return request.get(`${floatIpUrl}/${id}`)
}

export function removeFloatIps(params) {
  return request.delete(floatIpUrl, { data: params })
}

export function conditionFloatIp(params) {
  return request.get(`${floatIpUrl}/condition`, { params })
}

export function floatIpPorts(params) {
  return request.post(`${floatIpUrl}/${params.id}/ports`, wrapperParams(params))
}

export function removeFloatIpPorts(params) {
  return request.delete(`${floatIpUrl}/${params.id}/ports`, wrapperParams(params))
}

export function getFloatIpPorts(params) {
  return request.get(`${floatIpUrl}/${params.id}/ports`, {
    params: wrapperParams(params)
  })
}

export function patchFloatIpPorts(params) {
  return request.patch(`${floatIpUrl}/${params.id}`, wrapperParams(params))
}

// 浮动IP
const ipUrl = '/ims/v1/ips'
export function getIp(params) {
  return request.get(ipUrl, {
    params
  })
}
export function createIp(params) {
  return request.post(ipUrl, wrapperParams(params))
}
export function removeIp(id) {
  return request.delete(`${ipUrl}/${id}`)
}

export function detailIp(id) {
  return request.get(`${ipUrl}/${id}`)
}
export function patchIps(action, params) {
  return request.patch(`${ipUrl}/${params.id}`, {
    action: action,
    remark: params.remark
  })
}

export function conditionIp(params) {
  return request.get(`${ipUrl}/condition`, { params })
}

// IP池
const ipPoolUrl = '/ims/v1/ip/pools'
export function getIpPool(params) {
  return request.get(ipPoolUrl, {
    params
  })
}

export function createIpPool(params) {
  return request.post(ipPoolUrl, wrapperParams(params))
}

export function modifyIpPool(params) {
  return request.put(`${ipPoolUrl}/${params.id}`, wrapperParams(params))
}

export function removeIpPool(id) {
  return request.delete(`${ipPoolUrl}/${id}`)
}

export function detailIpPool(id) {
  return request.get(`${ipPoolUrl}/${id}`)
}

export function conditionIpPool(params) {
  return request.get(`${ipPoolUrl}/condition`, { params })
}

export function scanIp(params) {
  return request.put('/ims/v1/ips', wrapperParams(params))
}

export function getDetailIp(params) {
  return request.get(`${ipPoolUrl}/${params.id}/ips`, { params })
}

// 负载均衡
const lbUrl = '/ims/v1/lbs'
export function getLb(params) {
  return request.get(lbUrl, {
    params
  })
}

export function createLb(params) {
  return request.post(lbUrl, wrapperParams(params))
}

export function modifyLb(params) {
  return request.put(`${lbUrl}/${params.id}`, wrapperParams(params))
}

export function removeLb(id) {
  return request.delete(`${lbUrl}/${id}`)
}

export function detailLb(id) {
  return request.get(`${lbUrl}/${id}`)
}

export function conditionLb(params) {
  return request.get(`${lbUrl}/condition`, { params })
}

export function removeLbs(params) {
  return request.delete(lbUrl, { params: wrapperParams(params) })
}

const lbLintenUrl = '/ims/v1/lb/listeners'
export function getLbListen(params) {
  return request.get(lbLintenUrl, {
    params
  })
}

export function createLbListen(params) {
  return request.post(lbLintenUrl, wrapperParams(params))
}

export function modifyLbListen(params) {
  return request.put(`${lbLintenUrl}/${params.id || params.listener.id}`, wrapperParams(params))
}

export function removeLbListen(id) {
  return request.delete(`${lbLintenUrl}/${id}`)
}

export function detailLbListen(id) {
  return request.get(`${lbLintenUrl}/${id}`)
}

export function removeLbListens(params) {
  return request.delete(lbLintenUrl, { params: wrapperParams(params) })
}

const lbLintenUserUrl = '/ims/v1/lb/members'
export function getLbListenUser(params) {
  return request.get(lbLintenUserUrl, {
    params
  })
}

export function createLbListenUser(params) {
  return request.post(lbLintenUserUrl, wrapperParams(params))
}

export function modifyLbListenUser(params) {
  return request.put(`${lbLintenUserUrl}/${params.id}`, wrapperParams(params))
}

export function removeLbListenUser(id) {
  return request.delete(`${lbLintenUserUrl}/${id}`)
}

export function detailLbListenUser(id) {
  return request.get(`${lbLintenUserUrl}/${id}`)
}

export function manageLbListenUser(params) {
  return request.patch(`/ims/v1/lb/pools/${params.id ? params.id : params.poolId}/members`, wrapperParams(params))
}

// 网络
const networkUrl = '/ims/v1/networks'
export function getNetwork(params) {
  return request.get(networkUrl, {
    params
  })
}
export function getAllNetworkForTower(params) {
  return request.get(`${networkUrl}/listAll`, {
    params
  })
}
export function createNetwork(params) {
  return request.post(networkUrl, wrapperParams(params))
}

export function modifyNetwork(params) {
  return request.put(`${networkUrl}/${params.id}`, wrapperParams(params))
}

export function removeNetwork(id) {
  return request.delete(`${networkUrl}/${id}`)
}

export function detailNetwork(id) {
  return request.get(`${networkUrl}/${id}`)
}

export function removeNetworks(params) {
  return request.delete(networkUrl, { params: wrapperParams(params) })
}

export function conditionNetwork(obj) {
  const params = { condition: JSON.stringify(obj) }
  return request.get(`${networkUrl}/condition`, { params })
}

export function networkTenant(params) {
  return request.post(`${networkUrl}/${params.id}/tenants`, params)
}

export function getNetworkTenant(params) {
  return request.get(`${networkUrl}/${params.id}/tenants`, wrapperParams(params))
}

export function networkHosts(params) {
  return request.get(`${networkUrl}/${params.id}/hosts`, { params })
}

export function networkVms(params) {
  return request.get(`${networkUrl}/${params.id}/vms`, { params })
}

export function hostNetowrk(params) {
  return request.get(`/ims/v1/hosts/${params.id}/networks`, {
    params: wrapperParams(params),
    type: 'Host'
  })
}

// 标准交换机
const networkSwitchsUrl = '/ims/v1/vswitches'
export function createSwitchs(params) {
  return request.post(networkSwitchsUrl, wrapperParams(params))
}

export function modifySwitchs(params) {
  return request.put(`${networkSwitchsUrl}/${params.id}`, wrapperParams(params))
}

export function removeSwitchs(params) {
  return request.delete(`${networkSwitchsUrl}/${params.id}`, { params })
}

export function detailSwitchs(id) {
  return request.get(`${networkSwitchsUrl}/${id}`)
}

export function patchSwitchs(params) {
  return request.patch(`${networkSwitchsUrl}/${params.id}/hosts`, wrapperParams(params))
}

export function createHostSwitchs(params) {
  return request.post('/ims/v1/hosts/switches', { ...wrapperParams(params), type: 'Vmware' })
}

// 端口组
const pgsUrl = '/ims/v1/pgs'
export function getPgs(params) {
  return request.get(pgsUrl, {
    params
  })
}

export function getCnwarePgs(params) {
  return request.get('/ims/v1/pgs/condition', {
    params
  })
}

export function createPgs(params) {
  return request.post(pgsUrl, wrapperParams(params))
}

export function modifyPgs(params) {
  return request.put(`${pgsUrl}/${params.id}`, wrapperParams(params))
}

export function removePgs(params) {
  return request.delete(`${pgsUrl}/${params.id}`, { params })
}

export function detailPgs(id) {
  return request.get(`${pgsUrl}/${id}`)
}

export function removePgss(params) {
  return request.delete(pgsUrl, { params: wrapperParams(params) })
}

export function conditionPgs(params) {
  return request.get(`${pgsUrl}/condition`, { params })
}

export function getVcTask(id) {
  return request.get(`/ims/v1/task-message/${id}`)
}

// 云主机
const vmUrl = '/ims/v1/vms'
export function getVm(params) {
  return request.get(vmUrl, { params })
}
export function getVmCondition(params) {
  return request.get(`${vmUrl}/condition`, { params: { condition: JSON.stringify(params) } })
}

export function createVm(action, params) {
  return request.post(vmUrl, { action: action, ...wrapperParams(params) })
}

export function syncVm() {
  return request.post(`${vmUrl}/sync`)
}

export function modifyVm(params) {
  return request.put(`${vmUrl}/${params.id}`, wrapperParams(params))
}
export function modifyCloudTowerNetcard(params) {
  return request.post(`${vmUrl}/updateVmNics`, params)
}

export function removeVm(id) {
  const params = { id: id }
  return request.delete(`${vmUrl}/${id}`, params)
}

export function detailVm(id) {
  return request.get(`${vmUrl}/${id}`)
}

export function conditionVm(obj) {
  const params = { condition: JSON.stringify(obj) }
  // if (obj.condition) {
  //   const { condition, ...others } = obj
  //   params = { condition: JSON.stringify(condition), ...others }
  // }
  return request.get(`${vmUrl}/condition`, { params })
}

export function removeVms(params) {
  return request.delete(vmUrl, { data: params })
}

export function getVmChart(params) {
  return request.get(`${vmUrl}/summary`, { params: wrapperParams(params) })
}

export function getVmNetworks(params) {
  return request.get(`${vmUrl}/networks`, { params })
}

export function patchVm(action, params) {
  return request.patch(vmUrl, { action: action, ...wrapperParams(params) })
}

export function modifyVmDisk(params) {
  return request.put(`${vmUrl}/${params.id}/disks`, wrapperParams(params))
}

export function patchVms(action, params) {
  return request.patch(vmUrl, {
    action: action,
    ids: params
  })
}

export function recycleVms(params) {
  return request.patch(vmUrl, {
    action: 'recycle',
    resourceUuids: params
  })
}

export function patchVmId(action, params) {
  return request.patch(`${vmUrl}/${params.id ? params.id : params.serverId}`, {
    action: action,
    ...wrapperParams(params)
  })
}
export function vmUsers(params) {
  return request.post(`${vmUrl}/users`, wrapperParams(params))
}
export function vmUsersByCmp(params) {
  return request.post(`${vmUrl}/users`, wrapperParams(params))
}

export function vmTenants(params) {
  return request.put(`${vmUrl}/tenant`, wrapperParams(params))
}

export function vmSnapshot(params) {
  return request.post(`${vmUrl}/${params.serverId}/snapshots`, wrapperParams(params))
}

export function removeVmUsers(params) {
  return request.delete(`${vmUrl}/${params.id}/users`, {
    params: wrapperParams(params)
  })
}

export function modifyVmAccounts(params) {
  return request.put(`${vmUrl}/${params.id}/accounts`, wrapperParams(params))
}

export function modifyVmVcPassword(params) {
  return request.put(`${vmUrl}/${params.id}/password`, wrapperParams(params))
}

export function modifyVmOpPassword(params) {
  return request.patch(`${vmUrl}/${params.id}/password`, wrapperParams(params))
}

export function vmHotConfigEnable(params) {
  return request.patch(`${vmUrl}/${params.id ? params.id : params.serverId}/pluggable`, wrapperParams(params))
}

export function vmVmtools(action, params) {
  return request.patch(`${vmUrl}/${params.id}/vmtools`, {
    action: action,
    ...wrapperParams(params)
  })
}
export function beforeAccessResource(id, params) {
  return request.get(`/nms/v1/resources/vm_access/${id}`, {
    params: params
  })
}
export function accessResource(action, params) {
  return request.patch(`/nms/v1/resources/vm_access/${params.id}`, {
    action: action,
    ...wrapperParams(params)
  })
}

export function modifyVmTags(params) {
  return request.put(`${vmUrl}/tags`, wrapperParams(params))
}

export function getVmSize(id) {
  return request.get(`${vmUrl}/${id}/available/sizes`)
}

export function startGeneral(id) {
  return request.patch(`${vmUrl}/${id}/generalize`)
}

export function modifyTags(params) {
  return request.post('/ims/v1/tags/resources', wrapperParams(params))
}

export function getVmConsole(id, params) {
  return request.get(`${vmUrl}/${id}/console`, {
    params: wrapperParams(params)
  })
}

export function getVcConsole(id, params) {
  return request.get(`${vmUrl}/${id}/console`, { params })
}
export function getCnVcConsole(id, params) {
  return request.get(`${vmUrl}/${id}/cnConsoleUrl`, {
    params
  })
}

export function getVmVnc(params) {
  return request.get(`${vmUrl}/vnc`, { params })
}
export function getVmTickets(params) {
  return request.get(`${vmUrl}/${params.id}/tickets`, {
    params: wrapperParams(params)
  })
}

export function getVmStatistics(params) {
  return request.get(`${vmUrl}/statistics`, {
    params: wrapperParams(params)
  })
}

export function vmTools(params) {
  return request.patch(`${vmUrl}/${params.id}/vmtools`, { params })
}

// 云主机安全组
export function vmJoinGroup(params) {
  return request.post(`${vmUrl}/${params.id}/sgroups`, wrapperParams(params))
}

export function vmJoinGroupAction(action, params) {
  return request.post(`${vmUrl}/${params.id}/sgroups`, {
    action: action,
    ...wrapperParams(params)
  })
}

export function vmDeleteGroup(params) {
  return request.delete(`${vmUrl}/${params.id}/sgroups`, {
    params: wrapperParams(params)
  })
}

export function getVmGroup(id, params) {
  return request.get(`${vmUrl}/${id}/sgroups`, { params })
}

export function putGrouosVm(params) {
  return request.put(`${vmUrl}/groups`, wrapperParams(params))
}

export function getVmTemplates(params) {
  return request.get(`${vmUrl}/${params.vdcId}/templates`, {
    params: wrapperParams(params)
  })
}

export function createVmTemplate(params) {
  return request.post(`${vmUrl}/${params.id}/templates`, wrapperParams(params))
}

export function vmAttachNetowrk(params) {
  return request.post(`${vmUrl}/${params.id}/networks`, wrapperParams(params))
}

export function vmBaychMountNetowrk(params) {
  return request.post(`${vmUrl}/networks`, wrapperParams(params))
}

export function getVmNetowrk(params) {
  return request.get(`${vmUrl}/${params.id}/networks`, {
    params: wrapperParams(params)
  })
}

export function vmDeleteNetwork(params) {
  return request.delete(`${vmUrl}/${params.id}/networks`, {
    params: wrapperParams(params)
  })
}

export function vmDeleteNetworkQos(params) {
  return request.post(`${vmUrl}/${params.id}/networks/qos`, wrapperParams(params))
}

export function patchVmResize(action, params) {
  return request.patch(`${vmUrl}/${params.id}/flavors`, {
    action: action,
    ...wrapperParams(params)
  })
}

export function getVmFlavor(params) {
  return request.get(`${vmUrl}/flavors`, { params })
}

export function getVmPorts(id, params) {
  return request.get(`${vmUrl}/${id}/ports`, { params })
}

export function patchVmTime(action, params) {
  return request.patch(`${vmUrl}/${params.id ? params.id : params.resId}/empiretime`, { action: action, ...wrapperParams(params) })
}

// 云主机密钥
export function getVmKey(params) {
  return request.get(`${vmUrl}/${params.id}/keypairs`, { params })
}

export function patchVmKey(action, params) {
  return request.patch(`${vmUrl}/${params.id}/keypairs`, {
    action: action,
    ...wrapperParams(params)
  })
}

export function vmSnapshots(params) {
  return request.post('/ims/v1/vms/snapshots', wrapperParams(params))
}

export function patchVmVolumes(action, params) {
  return request.patch(`${vmUrl}/${params.serverId}/volumes`, {
    action: action,
    ...wrapperParams(params)
  })
}

export function getVmVolumes(action, params) {
  return request.get(`${vmUrl}/${params.id}/volumes`, {
    action: action,
    params: wrapperParams(params)
  })
}

export function getVmGroups(params) {
  return request.get(`${vmUrl}/vmGroups`, { params })
}

export function getVmData(id) {
  return request.get(`${vmUrl}/${id}/dataStore`)
}

export function getHWVmPricing(params) {
  return request.post(`${vmUrl}/pricing`, wrapperParams(params))
}

// 主机
const hostUrl = '/ims/v1/hosts'
export function getHost(params) {
  return request.get(hostUrl, {
    params
  })
}

export function createHost(params, type) {
  return request.post(hostUrl, { ...wrapperParams(params), type: type || 'Host' })
}

export function createVcHost(params) {
  return request.post(hostUrl, { ...params })
}

export function createPhost(params) {
  return request.post(hostUrl, params)
}

export function modifyHost(params, type) {
  return request.put(`${hostUrl}/${params.id}`, { ...wrapperParams(params), type: type || 'Host' })
}

export function removeHost(id, type) {
  return request.delete(`${hostUrl}/${id}`, { type: type || 'Host' })
}

export function removeHosts(params, type) {
  return request.delete(`${hostUrl}`, { params: wrapperParams(params), type: type || 'Host' })
}

export function detailHost(id, type) {
  return request.get(`${hostUrl}/${id}`, { type: type || 'Host' })
}

export function conditionHost(params) {
  return request.get(`${hostUrl}/condition`, { params })
}

export function patchHost(action, params, type) {
  return request.patch(`${hostUrl}/${params.id}`, {
    action: action,
    type: type || 'Host',
    ...wrapperParams(params)
  })
}

export function patchHosts(action, params) {
  return request.patch(hostUrl, { action: action, ...wrapperParams(params) })
}

export function createAlarmHost(params) {
  return request.post(`${hostUrl}/${params.id ? params.id : params.target}/thresholds`, { ...wrapperParams(params), type: 'Vmware' })
}

export function getAlarmHost(params) {
  return request.get(`${hostUrl}/${params.id}/thresholds`, {
    params: wrapperParams(params),
    type: 'Vmware'
  })
}

export function putCluterHost(params) {
  return request.put(`/ims/v1/clusters/${params.id ? params.id : params.hostId}/hosts`, wrapperParams(params))
}

export function putHostGroups(params) {
  return request.put(`/ims/v1/hosts/${params.id}/groups`, { ...wrapperParams(params), type: 'Host' })
}

export function getHostMetrics(params) {
  const { type } = params
  const obj = {
    params: params,
    type: type
  }
  return request.get(`${hostUrl}/${params.id}/metrics`, { params })
}
export function getDatastoresByHost(params) {
  return request.get(`${hostUrl}/${params.id}/datastores`, {
    params
  })
}

export function getClusterMetrics(params) {
  return request.get(`/ims/v1/clusters/${params.id}/metrics`, {
    params: wrapperParams(params)
  })
}

export function putHostTags(params) {
  return request.put('/ims/v1/hosts/tags', { ...wrapperParams(params), type: 'Vmware' })
}

// 快照
const snapshotUrl = '/ims/v1/snapshots'
export function getSnapshot(params) {
  return request.get(snapshotUrl, {
    params
  })
}

export function createSnapshot(params) {
  return request.post(snapshotUrl, wrapperParams(params))
}

export function modifySnapshot(params) {
  return request.put(`${snapshotUrl}/${params.id}`, params)
}

export function removeSnapshot(id) {
  return request.delete(`${snapshotUrl}/${id}`)
}

export function detailSnapshot(id) {
  return request.get(`${snapshotUrl}/${id}`)
}

export function removeSnapshots(params) {
  return request.delete(`${snapshotUrl}`, { data: params })
}

export function conditionSnapshot(params) {
  return request.get(`${snapshotUrl}/condition`, { params })
}

export function patchSnapshot(action, params) {
  return request.patch(`${snapshotUrl}/${params.id ? params.id : params.resId}`, { action: action, ...wrapperParams(params) })
}

export function getSnapshotTree(params) {
  return request.get(`${snapshotUrl}/tree`, {
    params
  })
}

// 机房
const roomUrl = '/ims/v1/rooms'
export function getRoom(params) {
  return request.get(roomUrl, {
    params
  })
}

export function createRoom(params) {
  return request.post(roomUrl, wrapperParams(params))
}

export function modifyRoom(params) {
  return request.put(`${roomUrl}/${params.id}`, wrapperParams(params))
}

export function removeRoom(id) {
  return request.delete(`${roomUrl}/${id}`)
}

export function detailRoom(id) {
  return request.get(`${roomUrl}/${id}`)
}

// 机柜
const rackUrl = '/ims/v1/racks'
export function getRack(params) {
  return request.get(rackUrl, {
    params
  })
}

export function createRack(params) {
  return request.post(rackUrl, wrapperParams(params))
}

export function modifyRack(params) {
  return request.put(`${rackUrl}/${params.id}`, wrapperParams(params))
}

export function removeRack(id) {
  return request.delete(`${rackUrl}/${id}`)
}

export function detailRack(id) {
  return request.get(`${rackUrl}/${id}`)
}

export function patchRack() {
  return request.patch(`${rackUrl}`, {
    action: 'sync'
  })
}

// 路由
const routerUrl = '/ims/v1/routers'
export function getRouter(params) {
  return request.get(routerUrl, {
    params
  })
}

export function createRouter(params) {
  return request.post(routerUrl, wrapperParams(params))
}

export function modifyRouter(params) {
  return request.put(`${routerUrl}/${params.id}`, wrapperParams(params))
}

export function removeRouter(id) {
  return request.delete(`${routerUrl}/${id}`)
}

export function detailRouter(id) {
  return request.get(`${routerUrl}/${id}`)
}

export function removeRouters(params) {
  return request.delete(`${routerUrl}`, { data: params })
}

export function conditionRouter(params) {
  return request.get(`${routerUrl}/${params.id}`, { params })
}

export function patchRouter(action, params) {
  return request.patch(`${routerUrl}/${params.id}`, {
    action: action,
    ...wrapperParams(params)
  })
}

export function attachRouterSubents(params) {
  return request.post(`${routerUrl}/${params.id}/subnets`, wrapperParams(params))
}

export function detachRouterSubents(params) {
  return request.delete(`${routerUrl}/${params.id}/subnets`, {
    params
  })
}

// 端口
const portUrl = '/ims/v1/ports'
export function getPort(params) {
  return request.get(portUrl, {
    params
  })
}

export function createPort(params) {
  return request.post(portUrl, wrapperParams(params))
}

export function modifyPort(params) {
  return request.put(`${portUrl}/${params.id}`, wrapperParams(params))
}

export function removePort(id) {
  return request.delete(`${portUrl}/${id}`)
}

export function detailPort(id) {
  return request.get(`${portUrl}/${id}`)
}

export function removePorts(params) {
  return request.delete(`${portUrl}`, { data: params })
}

export function conditionPort(params) {
  return request.get(`${portUrl}/${params.id}`, { params })
}

export function patchPort(action, params) {
  return request.patch(`${portUrl}/${params.id}`, {
    action: action,
    ...wrapperParams(params)
  })
}

export function attachPortSubents(params) {
  return request.post(`${portUrl}/${params.id}/subnets`, wrapperParams(params))
}

export function getPortVm(id, params) {
  return request.get(`${vmUrl}/${id}/ports`, { params })
}

export function getPortNetworks(id, params) {
  return request.get(`${networkUrl}/${id}/ports`, { params: wrapperParams(params) })
}

export function getMac(params) {
  return request.get(`${networkUrl}/mac`, { params })
}

// 操作记录
const resUrl = '/ims/v1/events'
export function getRes(params) {
  return request.get(resUrl, {
    params
  })
}

// 告警
export function getAlarmLevel(params) {
  return request.get('/cos/v1/quotas/thresholds', {
    params: wrapperParams(params)
  })
}

export function setAlarmLevel(params) {
  return request.post('/cos/v1/quotas/thresholds', wrapperParams(params))
}

// osd
const osdUrl = '/dms/v1/storages/osds'
export function getOsd(params) {
  return request.get(osdUrl, {
    params
  })
}

export function createOsd(params) {
  return request.post(osdUrl, wrapperParams(params))
}

export function modifyOsd(params) {
  return request.put(`${osdUrl}/${params.id}`, wrapperParams(params))
}

export function removeOsd(id) {
  return request.delete(`${osdUrl}/${id}`)
}

export function detailOsd(id) {
  return request.get(`${osdUrl}/${id}`)
}

export function patchOsd(action, params) {
  return request.patch(`${osdUrl}/${params.id}`, {
    action: action,
    ...wrapperParams(params)
  })
}

export function actionOsd(action, params) {
  return request.post(osdUrl, { action: action, ...wrapperParams(params) })
}

// pool
const poolUrl = '/ims/v1/ceph/pools'
export function getPool(params) {
  return request.get(poolUrl, {
    params
  })
}

export function createPool(params) {
  return request.post(poolUrl, wrapperParams(params))
}

export function modifyPool(params) {
  return request.put(`${poolUrl}/${params.id}`, wrapperParams(params))
}

export function removePool(id) {
  return request.delete(`${poolUrl}/${id}`)
}

export function detailPool(id) {
  return request.get(`${poolUrl}/${id}`)
}

// 资源池
const resPoolUrl = '/ims/v1/vrps'
export function getRespool(params) {
  return request.get(`${resPoolUrl}/condition`, {
    params
  })
}

export function createRespool(params) {
  return request.post(resPoolUrl, wrapperParams(params))
}

export function modifyRespool(params) {
  return request.put(`${resPoolUrl}/${params.id}`, wrapperParams(params))
}

export function removeRespool(id) {
  return request.delete(`${resPoolUrl}/${id}`)
}

export function detailRespool(id) {
  return request.get(`${resPoolUrl}/${id}`)
}

// VAPP
const vappsUrl = '/ims/v1/vapps'
export function getVapps(params) {
  return request.get(`${vappsUrl}/condition`, {
    params
  })
}

export function createVapps(params) {
  return request.post(vappsUrl, wrapperParams(params))
}

export function modifyVapps(params) {
  return request.put(`${vappsUrl}/${params.id}`, params)
}

export function removeVapps(id) {
  return request.delete(`${vappsUrl}/${id}`)
}

export function detailVapps(id) {
  return request.get(`${vappsUrl}/${id}`)
}

export function patchVapp(action, params) {
  return request.patch(`${imageUrl}/${params.id}`, {
    action: action,
    ...wrapperParams(params)
  })
}

// 资源
const resourceUrl = '/ims/v1/resources'
export function getResource(params) {
  return request.get(resourceUrl, {
    params
  })
}

export function createResource(params) {
  return request.post(resourceUrl, wrapperParams(params))
}

export function modifyResource(params) {
  return request.put(`${resourceUrl}/${params.id}`, wrapperParams(params))
}

export function removeResource(id) {
  return request.delete(`${resourceUrl}/${id}`)
}

export function detailResource(id) {
  return request.get(`${resourceUrl}/${id}`)
}

export function getResourceAccounts(params) {
  return request.get('/ims/v1/resources/accounts', {
    params: wrapperParams(params)
  })
}

export function getResourceAccount(params) {
  return request.get('/ims/v1/resources/account', {
    params
  })
}

export function putTimetask(params, url) {
  return request.put(`/${url || 'ims'}/v1/timedtask/${params.id}`, wrapperParams(params))
}

export function taskServer(params) {
  return request.post('/ims/v1/server/task', wrapperParams(params))
}

export function getTaskServer(params) {
  return request.get('/ims/v1/server/task', { params: wrapperParams(params) })
}

// csc订购

const cloudservicesUrl = '/cos/v1/cloudservices'

export function createCloudServices(params) {
  return request.post(cloudservicesUrl, wrapperParams(params))
}
export function shoppingCloudServices(params) {
  return request.post('/cos/v1/shopping/cart', wrapperParams(params))
}

export function getVmApply(params) {
  return request.get('/cos/v1/cloud/resource/apply', { params: wrapperParams(params) })
}
export function getOperationsApply(params) {
  return request.get('/cos/v1/operations/reports/apply', { params: wrapperParams(params) })
}
// 云主机存储策略
export function getVmPbm(params) {
  return request.get('/ims/v1/pbm/profile', { params })
}

export function patchDisk(params) {
  return request.patch('/ims/v1/vms/disks', {
    ...wrapperParams(params)
  })
}

// 克隆vc
export function vcCloneVm(params) {
  return request.post('/cos/v1/resource/clone', wrapperParams(params))
}

export function deleteRecycleVm(params) {
  return request.delete('/cos/v1/resource')
}

// 清除同步日志记录
export function deletePlatformLog(params) {
  return request.delete('/cos/v1/vendors/records/time', { params: wrapperParams(params) })
}

const FarmssUrl = '/ims/v1/horizon/farms'
export function getFarms(params) {
  return request.get(FarmssUrl, {
    params
  })
}
export function createFarms(params) {
  return request.post(FarmssUrl, wrapperParams(params))
}

export function modifyFarms(params) {
  return request.put(`${FarmssUrl}/${params.id}`, wrapperParams(params))
}

export function removeFarms(id) {
  return request.delete(`${FarmssUrl}/${id}`)
}

export function detailFarms(id) {
  return request.get(`${FarmssUrl}/${id}`)
}

const SessionssUrl = '/ims/v1/horizon/sessions'
export function getSessions(params) {
  return request.get(SessionssUrl, {
    params
  })
}
export function createSessions(params) {
  return request.post(SessionssUrl, wrapperParams(params))
}

export function modifySessions(params) {
  return request.put(`${SessionssUrl}/${params.id}`, wrapperParams(params))
}

export function removeSessions(id) {
  return request.delete(`${SessionssUrl}/${id}`)
}

export function detailSessions(id) {
  return request.get(`${SessionssUrl}/${id}`)
}

const userOrgroupsUrl = '/ims/v1/horizon/users-or-groups'
export function getuserOrgroup(params) {
  return request.get(userOrgroupsUrl, {
    params
  })
}
export function createuserOrgroup(params) {
  return request.post(userOrgroupsUrl, wrapperParams(params))
}

export function modifyuserOrgroup(params) {
  return request.put(`${userOrgroupsUrl}/${params.id}`, wrapperParams(params))
}

export function removeuserOrgroup(id) {
  return request.delete(`${userOrgroupsUrl}/${id}`)
}

export function detailuserOrgroup(id) {
  return request.get(`${userOrgroupsUrl}/${id}`)
}

const VcenterssUrl = '/ims/v1/horizon/vcenters'
export function getVcenters(params) {
  return request.get(VcenterssUrl, {
    params
  })
}
export function createVcenters(params) {
  return request.post(VcenterssUrl, wrapperParams(params))
}

export function modifyVcenters(params) {
  return request.put(`${VcenterssUrl}/${params.id}`, wrapperParams(params))
}

export function removeVcenters(id) {
  return request.delete(`${VcenterssUrl}/${id}`)
}

export function detailVcenters(id) {
  return request.get(`${VcenterssUrl}/${id}`)
}

const desktoPoolsUrl = '/ims/v1/horizon/desktop-pools'
export function getDesktoPool(params) {
  return request.get(desktoPoolsUrl, {
    params
  })
}
export function createDesktoPool(params) {
  return request.post(desktoPoolsUrl, wrapperParams(params))
}

export function modifyDesktoPool(params) {
  return request.put(`${desktoPoolsUrl}/${params.id}`, wrapperParams(params))
}

export function removeDesktoPool(id) {
  return request.delete(`${desktoPoolsUrl}/${id}`)
}

export function detailDesktoPool(id) {
  return request.get(`${desktoPoolsUrl}/${id}`)
}

// 内容库
const libraryUrl = '/ims/v1/content/libraries'
export function getLibrary(params) {
  return request.get(libraryUrl, {
    params
  })
}

export function detailLibrary(id) {
  return request.get(`${libraryUrl}/${id}`)
}

export function createLibraryServer(params) {
  return request.post(`${libraryUrl}/deploy`, wrapperParams(params))
}

export function detailLibraryList(params) {
  return request.get(`${libraryUrl}/items`, {
    params
  })
}

// 金山回归接口
// logAnalytics
const logAnalyticsUrl = '/ims/v1/log/analytics/list'
export function getLogAnalytics(params) {
  return request.get(logAnalyticsUrl, {
    params
  })
}

export function createLogAnalytics(params) {
  return request.post('/ims/v1/log/analytics', wrapperParams(params))
}

export function removeLogAnalytics(params) {
  return request.delete('/ims/v1/log/analytics/remove', { params: wrapperParams(params) })
}

export function detailLogAnalytics(params) {
  return request.post('/ims/v1/log/analytics/detail', wrapperParams(params))
}

export function removeResourceUsers(url, params) {
  return request.delete(`${url}/${params.id}/users`, {
    params: wrapperParams(params)
  })
}

export function resourceBatchUsers(url, params) {
  return request.post(url, wrapperParams(params))
}

export function resourceUsers(url, params) {
  return request.post(`${url}/${params.id}/users`, wrapperParams(params))
}

export function vmBindLog(id, params) {
  return request.post(`/ims/v1/vms/${id}/extension`, wrapperParams(params))
}

// 华泰回归接口
export function createTags(params) {
  return request.post('/ims/v1/tag', wrapperParams(params))
}

export function copyImage(params) {
  return request.post(`${imageUrl}/copy`, wrapperParams(params))
}

export function createVmConfigSeq(params) {
  return request.post(`${vmUrl}/configSeq`, wrapperParams(params))
}

export function detailSoftCategory(val) {
  return request.get('/sms/v1/dictionaries/children', {
    params: {
      value: val
    }
  })
}

export function getIpvs(params) {
  return request.get('/ims/v1/vpcs/cidr', {
    params
  })
}
export function getTags(params) {
  return request.get('ims/v1/tag', {
    params
  })
}
// 弹性IP
const elasticipsUrl = '/ims/v1/elasticips'
export function getElasticips(params) {
  return request.get(elasticipsUrl, {
    params
  })
}
export function getElasticipsFrees(params) {
  return request.get(`${elasticipsUrl}/frees`, {
    params
  })
}

export function getListEip(params) {
  return request.get(`${elasticipsUrl}/frees`, {
    params: wrapperParams(params)
  })
}
export function unreleaseElasticips(params) {
  return request.post(`${elasticipsUrl}`, params)
}
export function releaseElasticips(id) {
  return request.delete(`${elasticipsUrl}/${id}`)
}
export function checkElasticips(id) {
  return request.get(`${elasticipsUrl}/${id}`)
}
export function associateElasticipsIp(id, params) {
  return request.patch(`${elasticipsUrl}/${id}`, params)
}
export function disAssociateElasticipsIp(params, id) {
  return request.patch(`${elasticipsUrl}/${id}`, params)
}
export function editElasticipsIp(id, params) {
  return request.put(`${elasticipsUrl}/${id}`, wrapperParams(params))
}
export function editBandwidth(id, params) {
  return request.put(`${elasticipsUrl}/bandwidth/${id}`, params)
}

export function getVmBusiness(id) {
  return request.get(`${vmUrl}/getBusinessById/${id}`)
}

export function mapSubnet(id, params) {
  return request.patch(`${subnetUrl}/${id}/mapping`, params)
}

export function operationIpvs(id, params) {
  return request.patch(`ims/v1/vpcs/${id}/operation`, params)
}

export function operationSubIpvs(id, params) {
  return request.patch(`ims/v1/subnets/${id}/operation`, params)
}

export function setSubnet(id, params) {
  return request.patch(`${subnetUrl}/${id}`, params)
}

export function terminationProtected(params, id) {
  return request.patch(`ims/v1/vms/${id}`, params)
}

// 互联网网关
const natGatway = '/ims/v1/natgateway'
export function getNatGatway(params) {
  return request.get(natGatway, {
    params
  })
}
export function getNatGatwayDetail(id) {
  return request.get(`${natGatway}/${id}`)
}
export function addNatGatway(params) {
  return request.post(natGatway, params)
}
export function editNatGatway(id, params) {
  return request.put(`${natGatway}/${id}`, wrapperParams(params))
}
export function deleteNatGatway(id, params) {
  if (params != null) {
    return request.delete(`${natGatway}/${id}`, {
      params
    })
  } else {
    return request.delete(`${natGatway}/${id}`)
  }
}
export function detachNatGatway(params, id) {
  return request.patch(`${natGatway}/${id}`, params)
}
export function attachNatGatway(params, id) {
  return request.patch(`${natGatway}/${id}`, params)
}

// 负载均衡器
export function getBalance(params) {
  return request.get('/ims/v1/lbs', {
    params
  })
}
export function detailBalance(id) {
  return request.get(`/ims/v1/lbs/${id}`)
}
export function deleteBalancer(id) {
  return request.delete(`/ims/v1/lbs/${id}`)
}
export function editHuaweiBalance(id, params) {
  return request.put(`/ims/v1/lbs/${id}`, wrapperParams(params))
}
export function editBalance(params) {
  return request.put(`/ims/v1/lbs/${params.balancer.id}`, wrapperParams(params))
}
export function balanceSetting(id, params) {
  return request.patch(`/ims/v1/lbs/${id}`, params)
}
export function getListeners(params) {
  return request.get('/ims/v1/lb/listeners', {
    params
  })
}
export function getTargetgroups(params) {
  return request.get('/ims/v1/lb/targetgroups', {
    params
  })
}
export function detailTargetgroups(id) {
  return request.get(`/ims/v1/lb/targetgroups/${id}`)
}
export function getTargets(params) {
  return request.get('/ims/v1/lb/targets', {
    params
  })
}
export function getRoutetables(params) {
  return request.get('/ims/v1/routetables', {
    params
  })
}
export function createRoutetables(params) {
  return request.post('/ims/v1/routetables', wrapperParams(params))
}
export function delRoutetables(id) {
  return request.delete(`/ims/v1/routetables/${id}`)
}
export function editRoutetables(params) {
  return request.put(`/ims/v1/routetables/${params.id}`, wrapperParams(params))
}
export function settingRoutetables(params) {
  return request.patch('/ims/v1/routetables/associations', wrapperParams(params))
}
export function getRoutetablesDetail(id) {
  return request.get(`/ims/v1/routetables/${id}`)
}
export function getRoutetablesDetailRoute(params) {
  return request.get('/ims/v1/routetables/routes', {
    params
  })
}
export function createRoutetablesDetailRoute(params) {
  return request.post('/ims/v1/routetables/routes', params)
}
export function delRoutetablesDetailRoute(id) {
  return request.delete(`/ims/v1/routetables/routes/${id}`)
}
export function getRoutetablesSubnetAssociations(params) {
  return request.get('/ims/v1/routetables/associations', {
    params
  })
}
export function getRoutetablesSubnet(params) {
  return request.get('/ims/v1/subnets', {
    params
  })
}
export function getRoutetablesCreateSubnet(params) {
  return request.post('/ims/v1/routetables/associations', wrapperParams(params))
}
export function getRoutetablesEditSubnet(params) {
  return request.patch('/ims/v1/routetables/associations', wrapperParams(params))
}
export function getRoutetablesDelSubnet(id, params) {
  if (params) {
    return request.delete(`/ims/v1/routetables/associations/${id}`, wrapperParams(params))
  } else {
    return request.delete(`/ims/v1/routetables/associations/${id}`)
  }
}
export function deleteTargetObject(id, params) {
  return request.patch(`ims/v1/lb/targetgroups/${id}/operation`, params)
}
// 目标群组 获取table的数据
export function getInstanceDataList(params) {
  return request.get('ims/v1/vms', {
    params: params
  })
}
// 目标群组instance时，注册目标
export function registerTargets(id, params) {
  return request.patch(`ims/v1/lb/targetgroups/${id}/operation`, params)
}
// 删除目标群组
export function deleteTargetGroup(id) {
  return request.delete(`ims/v1/lb/targetgroups/${id}`)
}
// 新增目标群组
export function createTargetGroup(params) {
  return request.post('ims/v1/lb/targetgroups', wrapperParams(params))
}
// 删除负载均衡
export function deleteBalance(id) {
  return request.delete(`ims/v1/lbs/${id}`)
}
// 删除负载均衡侦听器
export function deleteBalanceWatch(id) {
  return request.delete(`ims/v1/lb/listeners/${id}`)
}
export function getAliEigs(params) {
  return request.get('ims/v1/natgateway/availableGateway', {
    params: params
  })
}
export function getAliEnis(params) {
  return request.get('ims/v1/azure/nics/availableNics', {
    params: params
  })
}
export function getAliElbs(params) {
  return request.get('ims/v1/lbs/availableLbs', {
    params: params
  })
}
export function getSants(params) {
  return request.get('/ims/v1/natgateway/snat/rule', {
    params: params
  })
}
export function getSantSubnets(params) {
  return request.get('/ims/v1/natgateway/snat/rule/subnet', {
    params
  })
}
export function getSantEcss(params) {
  return request.get('/ims/v1/natgateway/snat/rule/ecs', {
    params
  })
}
export function getSantIps(params) {
  return request.get('/ims/v1/elasticips/natgateway', {
    params
  })
}
export function createSant(params) {
  return request.post('/ims/v1/natgateway/snat/rule', wrapperParams(params))
}
export function editSant(id, params) {
  return request.put(`/ims/v1/natgateway/snat/rule/${id}`, wrapperParams(params))
}
export function delSant(id) {
  return request.delete(`/ims/v1/natgateway/snat/rule/${id}`)
}
export function getEditSnatRule(id) {
  return request.get(`/ims/v1/natgateway/snat/rule/${id}`)
}
export function getDants(params) {
  return request.get('/ims/v1/natgateway/dnat/rule', {
    params: params
  })
}
export function getDantEips(params) {
  return request.get('/ims/v1/natgateway/dnat/rule/eip', {
    params: params
  })
}
export function getDantPrivateIps(params) {
  return request.get('/ims/v1/natgateway/listAvailablePrivateIp', {
    params: params
  })
}
export function createDant(params) {
  return request.post('/ims/v1/natgateway/dnat/rule', wrapperParams(params))
}
export function getEditDnatRule(id) {
  return request.get(`/ims/v1/natgateway/dnat/rule/${id}`)
}
export function editDant(id, params) {
  return request.put(`/ims/v1/natgateway/dnat/rule/${id}`, wrapperParams(params))
}
export function delDant(id) {
  return request.delete(`/ims/v1/natgateway/dnat/rule/${id}`)
}
export function getDantPrivateIp(id) {
  return request.get(`/ims/v1/natgateway/dnat/rule/${id}/port`)
}

export function createLbMembers(id, params) {
  return request.patch(`ims/v1/lb/pools/${id}/members`, wrapperParams(params))
}

export function createLbPools(params) {
  return request.post('ims/v1/lb/pools', wrapperParams(params))
}

export function deleteLbMembers(id, params) {
  return request.patch(`ims/v1/lb/pools/${id}/members`, wrapperParams(params))
}

export function deleteLbPools(id) {
  return request.delete(`ims/v1/lb/pools/${id}`)
}

export function editLbPools(id, params) {
  return request.put(`ims/v1/lb/pools/${id}`, wrapperParams(params))
}

export function getLbMembers(params) {
  return request.get('ims/v1/lb/members', {
    params
  })
}

export function createListeners(params) {
  return request.post('/ims/v1/lb/listeners', {
    params
  })
}

export function getNatList(params) {
  return request.get('/ims/v1/natgateway', {
    params
  })
}

export function delNat(id) {
  return request.delete(`/ims/v1/natgateway/${id}`)
}

export function getEditData(id) {
  return request.get(`/ims/v1/natgateway/${id}`)
}

export function getSubnets(params) {
  return request.get('/ims/v1/subnets', {
    params
  })
}

export function getElasticipsIp(params) {
  return request.get('/ims/v1/elasticips', {
    params
  })
}

export function createNatgateway(params) {
  return request.post('/ims/v1/natgateway', {
    params
  })
}

export function editNatgateway(params) {
  return request.put(`/ims/v1/natgateway/${params.id}`, wrapperParams(params))
}

export function editNat(id, params) {
  return request.put(`/ims/v1/natgateway/${id}`, wrapperParams(params))
}

export function getListAvailableForRoute(params) {
  return request.get('ims/v1/natgateway/listAvailableForRoute', {
    params
  })
}

export function getLbListenById(id) {
  return request.get(`${lbLintenUrl}/${id}`)
}

export function getLbPools(params) {
  return request.get('ims/v1/lb/pools', {
    params
  })
}

export function getListenControls(params) {
  return request.get('ims/v1/controls', {
    params
  })
}

export function getRegionZone(id, params) {
  return request.get(`/ims/v1/regions/${id}/zones`, {
    params: wrapperParams(params)
  })
}

export function removeHuaWeiVm(id, params) {
  return request.delete(`${vmUrl}/${id}`, {
    data: params
  })
}

export function createData(params) {
  return request.post('/ims/v1/lbs', params)
}

export function syncVdc(id, params) {
  const obj = new FormData()
  obj.append('type', params.type)
  return request.post(`${vdcUrl}/${id}/sync`, obj)
}
export function syncCluster(id) {
  return request.post(`/ims/v1/clusters/${id}/sync`)
}
export function syncHosts(id) {
  return request.post(`/ims/v1/hosts/${id}/sync`)
}

export function getopo(params) {
  return request.get('/ims/v1/instances/topology', {
    params
  })
}

export function conditionService(catelog) {
  return request.get('/cos/v1/cloud/services/condition', {
    params: {
      condition: JSON.stringify({
        condition: 'getServiceType',
        catalog: catelog
      })
    }
  })
}

export function conditionServiceNew(params) {
  return request.get('/cos/v1/cloud/services/condition', {
    params
  })
}
export function getDiskEncryptions(params) {
  return request.get('/ims/v1/disk/encryptions', {
    params: wrapperParams(params)
  })
}
export function getAccountSubnet(id) {
  return request.get(`${subnetUrl}/vpc/sa/${id}`)
}
export function modifyGroupRule(params) {
  return request.put(`${sgroupsRuleUrl}/${params.id}`, wrapperParams(params))
}

export function getResourceList() {
  return request.get('/cms/v1/monitor/resourcetype', { params: { params: JSON.stringify([{ param: { isTenant: true }, sign: 'EQ' }]), rows: 99, page: 1 } })
}
const sangforUrl = 'ims/v1/sangfor'
export function getAz() {
  return request.get(sangforUrl + '/host/listAz', { params: { simple: true } })
}
export function getGroupServerList(params) {
  return request.get(sangforUrl + '/groupServer', { params })
}
export function getTemplate(params) {
  downloadFile('/cos/v1/file/resource/template/download', params)
}

export function applyAlteration(params) {
  return request.post('cos/v1/resource/alteration', params)
}

// CNWARE网络
const cnwareNetworkUrl = '/ims/v1/cnware/network'
export function getCNWARENetwork(params) {
  return request.get(`${cnwareNetworkUrl}/list`, {
    params
  })
}
export function createCNWARENetwork(params) {
  return request.post(`${cnwareNetworkUrl}/create`, wrapperParams(params))
}
export function modifyCNWARENetwork(params) {
  return request.post(`${cnwareNetworkUrl}/modify`, wrapperParams(params))
}
export function removeCNWARENetwork(params) {
  return request.get(`${cnwareNetworkUrl}/remove`, {
    params
  })
}
export function getCNWARENetworkUsedIps(params) {
  return request.get(`${cnwareNetworkUrl}/queryUsedIps`, {
    params
  })
}
// 云宏虚拟机克隆
export function cloneVm(action, params) {
  return request.patch(`${vmUrl}/${params.id ? params.id : params.serverId}`, {
    action: action,
    ...wrapperParams(params)
  })
}
export function getCnTmpVolume(params) {
  return request.get('/ims/v1/volumes/filterTmpVolumes', {
    params
  })
}
// 云硬盘置备
export function getVolumeTypes(params) {
  return request.get('ims/v1/volume/types', { params })
}
