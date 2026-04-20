import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getStorages(params) {
  return request.get('/dms/v1/storages', {
    params: params
  })
}
export function createStorages(params) {
  return request.post('/dms/v1/storages', wrapperParams(params))
}
export function removeStorages(id) {
  return request.delete(`/dms/v1/storages/${id}`)
}
export function getStoragesDetail(id) {
  return request.get(`/dms/v1/storages/${id}`)
}
export function getRaids(id) {
  return request.get(`/dms/v1/storages/mdisks/${id}/raid`)
}
export function getRaidTactics(id, params) {
  return request.get(`/dms/v1/storages/mdisks/${id}/raid/tactics`, {
    params: wrapperParams(params)
  })
}
export function getRaidsByVendor(id, params) {
  return request.get(`/dms/v1/vendors/${id}/raids`, {
    params: params
  })
}
export function getPoolCapacity(id, params) {
  return request.get(`/dms/v1/storages/mdisks/${id}/pool/capacity`, {
    params: wrapperParams(params)
  })
}
export function modifyVolume(params) {
  return request.put(`/dms/v1/volumes/${params.id}`, wrapperParams(params))
}
export function removeVolume(id) {
  return request.delete(`/dms/v1/volumes/${id}`)
}
const mdiskUrl = '/dms/v1/storages/mdisks'

export function getMdisks(params) {
  return request.get(mdiskUrl, {
    params: params
  })
}
export function getMdisksDetail(id) {
  return request.get(`${mdiskUrl}/${id}`, {
    params: { id: id }
  })
}
export function createMdisks(params) {
  return request.post(`${mdiskUrl}`, wrapperParams(params))
}
// action=listByMdisk修改
export function getVolumebyMdisks(id, params) {
  return request.get(`${mdiskUrl}/${id}/volumes`, {
    params: params
  })
}

const diskUrl = '/dms/v1/storages/disks'

export function getDisks(params) {
  return request.get(diskUrl, {
    params: params
  })
}
export function getDisksDetail(id) {
  return request.get(`${diskUrl}/${id}`)
}
export function diskforUse(id, params) {
  return request.put(`${diskUrl}/${id}`, wrapperParams(params))
}

const poolUrl = '/dms/v1/storages/pools'

export function getPools(params) {
  return request.get(poolUrl, {
    params: params
  })
}
export function getPoolsDetail(id) {
  return request.get(`${poolUrl}/${id}`)
}
export function createPools(params) {
  return request.post(poolUrl, wrapperParams(params))
}
export function modifyPools(params) {
  return request.put(`${poolUrl}/${params.id}`, wrapperParams(params))
}
export function removePools(id) {
  return request.delete(`${poolUrl}/${id}`)
}

const flashUrl = '/dms/v1/storages/flashcopies'

export function getFlashcopies(params) {
  return request.get(flashUrl, {
    params: params
  })
}
export function getFlashcopiesDetail(id) {
  return request.get(`${flashUrl}/${id}`)
}
export function createFlashcopy(params) {
  return request.post(flashUrl, wrapperParams(params))
}
export function removeFlashcopies(id, params) {
  return request.delete(`${flashUrl}/${id}`, {
    data: wrapperParams(params)
  })
}
// 移入
export function moveInFlashcopies(flashCopyId, syncsetId) {
  return request.post(`${flashUrl}/${flashCopyId}/syncedsets/${syncsetId}`)
}
// 移除
export function moveOutFlashcopies(flashCopyId, syncsetId) {
  return request.delete(`${flashUrl}/${flashCopyId}/syncedsets/${syncsetId}`)
}
// 启动
export function starFlashcopies(id) {
  return request.patch(`${flashUrl}/${id}`, {
    action: 'start'
  })
}
// 停止
export function stopFlashcopies(id) {
  return request.patch(`${flashUrl}/${id}`, {
    action: 'stop'
  })
}
export function startFlashcopies(id) {
  return request.patch(`${flashUrl}/${id}`, {
    action: 'start'
  })
}

const syncedsetsUrl = '/dms/v1/storages/syncedsets'

export function getSyncedsets(params) {
  return request.get(syncedsetsUrl, {
    params: params
  })
}
export function createSyncedsets(params) {
  return request.post(syncedsetsUrl, wrapperParams(params))
}
export function modifySyncedsets(params) {
  return request.put(`${syncedsetsUrl}/${params.id}`, wrapperParams(params))
}
export function removeSyncedsets(id) {
  return request.delete(`${syncedsetsUrl}/${id}`)
}
export function getSyncedsetsDetail(id) {
  return request.get(`${syncedsetsUrl}/${id}`)
}
// 启动
export function startSyncedsets(id) {
  return request.patch(`${syncedsetsUrl}/${id}`, {
    action: 'start'
  })
}
// 停止
export function stopSyncedsets(id) {
  return request.patch(`${syncedsetsUrl}/${id}`, {
    action: 'stop'
  })
}

const hostsUrl = '/dms/v1/storages/hosts'

// 主机
export function getHosts(params) {
  return request.get(hostsUrl, {
    params: params
  })
}
// action修改
export function getHostsByAttach(id, params) {
  return request.get(`/dms/v1/storages/volumes/${id}/hosts/attached`, {
    params: params
  })
}
export function getHostsByDetach(id, params) {
  return request.get(`/dms/v1/storages/volumes/${id}/hosts/detached`, {
    params: params
  })
}
export function getHostsByHuawei(id, params) {
  return request.get(`/dms/v1/storages/volumes/${id}/hosts/viewed`, {
    params: params
  })
}
export function getHostsByXsky(id, params) {
  return request.get(`/dms/v1/storages/volumes/${id}/hosts/xsky`, {
    params: params
  })
}
export function getHostsDetail(id) {
  return request.get(`${hostsUrl}/${id}`)
}
export function createHost(params) {
  return request.post(hostsUrl, wrapperParams(params))
}
export function modifyHost(id, params) {
  return request.put(`${hostsUrl}/${id}`, wrapperParams(params))
}
export function removeHost(id) {
  return request.delete(`${hostsUrl}/${id}`)
}
export function getHostPorts(params) {
  return request.get(`${hostsUrl}/ports`, {
    params: params
  })
}
export function createHostPort(id, params) {
  return request.post(`${hostsUrl}/${id}/ports`, wrapperParams(params))
}
export function removeHostPort(id, params) {
  return request.delete(`${hostsUrl}/${id}/ports`, {
    data: wrapperParams(params)
  })
}
export function createHostGroup(id, params) {
  return request.post(`${hostsUrl}/${id}/groups`, wrapperParams(params))
}
export function removeHostGroup(id, params) {
  return request.delete(`${hostsUrl}/${id}/groups`, {
    data: wrapperParams(params)
  })
}
export function createHostVolume(id, params) {
  return request.post(`${hostsUrl}/${id}/volumes`, wrapperParams(params))
}
export function removeHostVolume(id, params) {
  return request.delete(`${hostsUrl}/${id}/volumes`, {
    data: wrapperParams(params)
  })
}
export function createVolumeHost(id, params) {
  return request.post(`/dms/v1/storages/volumes/${id}/hosts`, wrapperParams(params))
}
export function removeVolumeHost(id, params) {
  return request.delete(`/dms/v1/storages/volumes/${id}/hosts`, {
    data: wrapperParams(params)
  })
}
const nodesUrl = '/dms/v1/storages/nodes'

export function getNodes(params) {
  return request.get(nodesUrl, {
    params: params
  })
}
export function getNodesDetail(id) {
  return request.get(`${nodesUrl}/${id}`)
}
export function getNodesFcports(params) {
  return request.get(`${nodesUrl}/fcports`, {
    params: params
  })
}
export function getFcportsDetail(id) {
  return request.get(`${nodesUrl}/fcports/${id}`)
}
export function getMirrors(id) {
  return request.get(`/dms/v1/storages/volumes/${id}/mirrors`)
}
// 列表
export function getVolumeGroups(params) {
  return request.get('/dms/v1/storages/groups', {
    params: params
  })
}
// action=listByMember修改
export function getVolumeMemberByInclude(id, type, params) {
  return request.get(`dms/v1/storages/members/${id}/${type}/groups/include`, {
    params: params
  })
}
// action=listForMember修改
export function getVolumeMemberByExclude(id, type, params) {
  return request.get(`dms/v1/storages/members/${id}/${type}/groups/exclude`, {
    params: params
  })
}
// action=listGroupForView修改
export function getVolumeGroupsByExclude(id, params) {
  return request.get(`/v1/storages/groups/${id}/groups/exclude`, {
    params: params
  })
}
// 新增卷组
export function createGroup(params) {
  return request.post('/dms/v1/storages/groups', wrapperParams(params))
}
// 编辑卷组
export function modifyGroup(params) {
  return request.post(`/dms/v1/storages/groups/${params.id}`, wrapperParams(params))
}
// 移入卷组
export function removeInGroups(id, params) {
  return request.post(`/dms/v1/volumes/${id}/groups`, wrapperParams(params))
}
// 移出卷组
export function removeOutGroups(id, params) {
  return request.delete(`/dms/v1/volumes/${id}/groups`, {
    data: wrapperParams(params)
  })
}
export function removeGroup(id) {
  return request.delete(`/dms/v1/storages/groups/${id}`)
}
export function getGroupDetail(id) {
  return request.get(`/dms/v1/storages/groups/${id}`)
}
// 当前存储卷列表
export function getVolumeByGroupId(id, params) {
  return request.get(`/dms/v1/storages/groups/${id}/members`, {
    params: params
  })
}
// in out 修改
// 根据id查看添加删除存储卷的列表
export function addVolumeByGroupId(id, params) {
  return request.get(`/dms/v1/storages/groups/${id}/volumes/include`, {
    params: params
  })
}
export function removeVolumeByGroupId(id, params) {
  return request.get(`/dms/v1/storages/groups/${id}/volumes/exclude`, {
    params: params
  })
}
// 根据id查看添加删除主机的列表
export function addHostByGroupId(id, params) {
  return request.get(`/dms/v1/storages/groups/${id}/hosts/include`, {
    params: params
  })
}
export function removeHostByGroupId(id, params) {
  return request.get(`/dms/v1/storages/groups/${id}/hosts/exclude`, {
    params: params
  })
}
// 根据id查看添加删除端口的列表
export function addPortByGroupId(id, params) {
  return request.get(`/dms/v1/storages/groups/${id}/fcports/include`, {
    params: params
  })
}
export function removePortByGroupId(id, params) {
  return request.get(`/dms/v1/storages/groups/${id}/fcports/exclude`, {
    params: params
  })
}
// 添加存储卷
export function addVolumes(id, params) {
  return request.post(`/dms/v1/storages/groups/${id}/members`, wrapperParams(params))
}
// 删除存储卷
export function deleteVolumes(id, params) {
  return request.delete(`/dms/v1/storages/groups/${id}/members`, {
    data: wrapperParams(params)
  })
}
// 主机组映射列表接口
export function getViewsByGroupId(id, params) {
  return request.get(`/dms/v1/storages/groups/${id}/views`, {
    params: params
  })
}
// 添加主机组映射
export function addView(params) {
  return request.post(`/dms/v1/storages/groups/${params.volumeGroupId}/${params.hostGroupId}`, wrapperParams(params))
}
// 添加主机映射
export function addHostView(params) {
  return request.post(`/dms/v1/storages/groups/${params.id}/views`, wrapperParams(params))
}
// 删除主机组映射
export function deleteView(params) {
  return request.delete(`/dms/v1/storages/groups/${params.volumeGroupId}/${params.hostGroupId}`)
}
// 删除主机映射
export function deleteHostView(params) {
  return request.delete(`/dms/v1/storages/groups/${params.id}/views`, {
    data: wrapperParams(params)
  })
}
export function copyVolume(params) {
  return request.patch(`/dms/v1/volumes/${params.id}`, { action: 'copy', ...wrapperParams(params) })
}
// EMC Initiators
export function getFcPorts(params) {
  return request.get('/dms/v1/storages/nodes/fcports', {
    params: params
  })
}
export function createSnapshot(params, action) {
  return request.post('/dms/v1/snapshots', { action: action, ...wrapperParams(params) })
}
export function patchSnapshot(action, id) {
  return request.patch(`/dms/v1/snapshots/${id}`, { action: action })
}
