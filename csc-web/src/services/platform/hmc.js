import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/ims/v1/hmc'

export function modifyHeas(params) {
  return request.put(`${baseUrl}/heas/${params.id}`, wrapperParams(params))
}
export function getServersPorts(id) {
  return request.get(`${baseUrl}/servers/${id}/heas`)
}
export function getIOadapters(params) {
  return request.get(`${baseUrl}/ioadapters`, {
    params: params
  })
}
const partitionUrl = '/ims/v1/hmc/partitions'

export function getPartitions(params) {
  return request.get(partitionUrl, {
    params: params
  })
}
export function getPartitionsDetail(id) {
  return request.get(`${partitionUrl}/${id}`)
}
export function createPartitions(params) {
  return request.post(partitionUrl, wrapperParams(params))
}
export function modifyPartitions(params) {
  return request.put(`${partitionUrl}/${params.id}`, wrapperParams(params))
}
export function removePartitions(id, params) {
  return request.delete(`${partitionUrl}/${id}`, {
    data: wrapperParams(params)
  })
}
export function getPartitionsSlot(id) {
  return request.get(`${partitionUrl}/${id}/empty/slots`)
}
export function getVirtualSlot(params) {
  return request.get(`${partitionUrl}/${params.partitionId}/slots`, {
    params: wrapperParams(params)
  })
}
export function getPartitionsProfiles(id) {
  return request.get(`${partitionUrl}/${id}/profiles`)
}
export function operatePartitions(id, action) {
  return request.patch(`${partitionUrl}/${id}`, { action: action })
}
export function getPartitionsDisks(id, params) {
  return request.get(`${partitionUrl}/${id}/disks`, {
    params: params
  })
}

export function getPartitionProfiles(partitionId, params) {
  return request.get(`${partitionUrl}/${partitionId}/profiles`, {
    params: params
  })
}
export function getProfiles(params) {
  return request.get(`${partitionUrl}/profiles`, {
    params: params
  })
}
export function getProfilesDetail(partitionId, id) {
  return request.get(`${partitionUrl}/${partitionId}/profiles/${id}`)
}
export function createProfiles(params) {
  return request.post(`${partitionUrl}/${params.partitionId}/profiles`, wrapperParams(params))
}
export function modifyProfiles(partitionId, params) {
  return request.put(`${partitionUrl}/${partitionId}/profiles/${params.id}`, wrapperParams(params))
}
export function removeProfiles(partitionId, id) {
  return request.delete(`${partitionUrl}/${partitionId}/profiles/${id}`)
}

const serverUrl = '/ims/v1/hmc/servers'

export function getServers(params) {
  return request.get(serverUrl, {
    params: params
  })
}
export function getServersDetail(id) {
  return request.get(`${serverUrl}/${id}`)
}
export function createServers(params) {
  return request.post(serverUrl, wrapperParams(params))
}
export function modifyServers(params) {
  return request.put(`${serverUrl}/${params.id}`, wrapperParams(params))
}
export function operateServers(id, action) {
  return request.patch(`${serverUrl}/${id}`, { action: action })
}

const viosUrl = '/ims/v1/hmc/vios'
// 取消分配虚拟磁盘
export function unassignDisk(params) {
  return request.post(`${viosUrl}/${params.viosId}/vds`, wrapperParams(params))
}
export function getFcs(params) {
  return request.get(`${viosUrl}/${params.partitionId}/fcs`, {
    params: wrapperParams(params)
  })
}
// 为物理光纤通道选择存储
export function getStorageAdapter(params) {
  return request.post(`${viosUrl}/${params.partitionId}/fcs/adapters`, wrapperParams(params))
}
export function getPds(params) {
  return request.get(`${viosUrl}/${params.viosId}/pds`, {
    params: wrapperParams(params)
  })
}
export function getVds(params) {
  return request.get(`${viosUrl}/${params.lparId}/vds`, {
    params: wrapperParams(params)
  })
}
export function getVfcs(params) {
  return request.get(`${baseUrl}/vfcs`, {
    params: params
  })
}
export function createVfcs(params) {
  return request.post(`${baseUrl}/vfcs`, wrapperParams(params))
}
export function removeVfcs(id) {
  return request.delete(`${baseUrl}/vfcs/${id}`)
}
export function getPartitionVfcs(params) {
  return request.get(`${viosUrl}/${params.viosId}/partitions/${params.partitionId}/vfcs`, {
    params: wrapperParams(params)
  })
}
export function getVgs(params) {
  return request.get(`${baseUrl}/vgs`, {
    params: wrapperParams(params)
  })
}
export function createVgs(params) {
  return request.post(`${baseUrl}/vgs`, wrapperParams(params))
}
export function removeVgs(id) {
  return request.delete(`${baseUrl}/vgs/${id}`)
}
export function createVdisks(params) {
  return request.post(`${baseUrl}/vgs/${params.viosId}/vdisks`, wrapperParams(params))
}
export function removeVdisks(id, vDiskId, params) {
  return request.delete(`${baseUrl}/vgs/${id}/vdisks/${vDiskId}`, {
    data: wrapperParams(params)
  })
}
export function assignVdisks(id, vDiskId, params) {
  return request.post(`${baseUrl}/vgs/${id}/vdisks/${vDiskId}`, wrapperParams(params))
}
export function modifyVdisks(id, vDiskId, params) {
  return request.put(`${baseUrl}/vgs/${id}/vdisks/${vDiskId}`, wrapperParams(params))
}
export function getVgsSlots(params) {
  return request.get(`${baseUrl}/vgs/${params.viosId}/slots`, {
    params: wrapperParams(params)
  })
}
export function getSwitchs(params) {
  return request.get(`${baseUrl}/switchs`, {
    params: params
  })
}
export function createSwitchs(params) {
  return request.post(`${baseUrl}/switchs`, wrapperParams(params))
}
export function getSwitchsDetail(id, params) {
  return request.get(`${baseUrl}/switchs/${id}`, {
    params: wrapperParams(params)
  })
}
export function modifySwitchs(params) {
  return request.put(`${baseUrl}/switchs/${params.id}`, wrapperParams(params))
}
export function removeSwitchs(id) {
  return request.delete(`${baseUrl}/switchs/${id}`)
}
// AIX系统安装
export function getNim(params) {
  return request.get(`/ims/v1/nim/${params.id}`, {
    ...wrapperParams(params)
  })
}
export function installNim(params) {
  return request.post('/ims/v1/nim', wrapperParams(params))
}
export function cancelNim(params) {
  return request.patch(`/ims/v1/nim/${params.id}`, {
    ...wrapperParams(params)
  })
}

export function getVlanId(id) {
  return request.get(`${baseUrl}/switchs/${id}/vlanIds`)
}
export function createPocHa(params) {
  return request.post('/ims/v1/hmc/partitions/ha', wrapperParams(params))
}
export function createPocVg(params) {
  return request.post(`/ims/v1/hmc/partitions/${params.partitionId}/vg`, wrapperParams(params))
}
export function removePocVg(params) {
  return request.delete('/ims/v1/hmc/poc/vg', {
    data: wrapperParams(params)
  })
}
export function createPocLv(params) {
  return request.post(`/ims/v1/hmc/partitions/${params.partitionId}/lv`, wrapperParams(params))
}
export function removePocLv(params) {
  return request.delete('/ims/v1/hmc/poc/lv', {
    data: wrapperParams(params)
  })
}
