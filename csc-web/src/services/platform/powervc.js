import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/ims/v1/powervc'

// 光纤网

const fabrics = '/ims/v1/switches'
export function getFabrics(params) {
  return request.get(fabrics, {
    params
  })
}

export function createFabrics(params) {
  return request.post(fabrics, wrapperParams(params))
}

export function modifyFabrics(params) {
  return request.put(`${fabrics}/${params.id}`, wrapperParams(params))
}

export function removeFabrics(id) {
  return request.delete(`${fabrics}/${id}`)
}

export function fabricsDetail(id) {
  return request.get(`${fabrics}/${id}`)
}

// HMC连接
const hmcUrl = `${baseUrl}/hmcs`
export function createHmc(params) {
  return request.post(hmcUrl, wrapperParams(params))
}

export function modifyHmc(params) {
  return request.put(`${hmcUrl}/${params.id}`, wrapperParams(params))
}

export function removeHmc(id) {
  return request.delete(`${hmcUrl}/${id}`)
}

export function hmcDetail(id) {
  return request.get(`${hmcUrl}/${id}`)
}

export function getHmc(params) {
  return request.get(hmcUrl, {
    params
  })
}

// 按主机查询HMC连接
const hostHmcUrl = '/ims/v1/powervc/hosts'
export function getHostHmc(params) {
  return request.get(`${hostHmcUrl}/${params.id}/hmcs`, {
    params
  })
}

// 按平台查询HMC连接
const vendorHmcUrl = '/ims/v1/powervc/hmcs'
export function getVendorHmc(params) {
  return request.get(vendorHmcUrl, {
    params
  })
}

// 查询HMC纳管得所有主机
const joinHostUrl = '/ims/v1/hmcs'
export function getJoinHost(id) {
  return request.get(`${joinHostUrl}/${id}/hosts`)
}

// 查询HMC纳管得所有主机
const hmcHostUrl = '/ims/v1/powervc/hmcs'
export function getHmcHost(id) {
  return request.get(`${hmcHostUrl}/${id}/hosts`)
}

// 查询主机可用的SEA适配器
const hostSeaUrl = '/ims/v1/hosts'
export function getHostSea(id, params) {
  return request.get(`${hostSeaUrl}/${id}/seas`, { params: wrapperParams(params), type: 'Powervc' })
}

// 查询平台下所有主机及其可用的SEA适配器
const vendorSeaUrl = '/ims/v1/servers'
export function getendorSea(params) {
  return request.get(vendorSeaUrl, {
    params
  })
}

// 存储器
const storageUrl = '/ims/v1/storages'
export function getStorage(params) {
  return request.get(storageUrl, {
    params
  })
}

export function createStorage(params) {
  return request.post(storageUrl, wrapperParams(params))
}

export function modifyStorage(params) {
  return request.put(`${storageUrl}/${params.id}`, wrapperParams(params))
}

export function removeStorage(id) {
  return request.delete(`${storageUrl}/${id}`)
}

export function storageDetail(id) {
  return request.get(`${storageUrl}/${id}`)
}

export function storageContent(params) {
  return request.patch(storageUrl, wrapperParams(params))
}

// 按平台查询存储器
const vendorStorage = '/ims/v1/storages'
export function getVendorStorage(params) {
  return request.get(vendorStorage, {
    params
  })
}

// 查询所有尚未被Powervc管理的存储卷
const noStorage = '/ims/v1/storages'
export function getNoStorage(id, params) {
  return request.get(`${noStorage}/${id}/volumes`, {
    params
  })
}

// 验证环境
const environmentUrl = '/ims/v1/powervc/vendors'
export function putEnvironment(id) {
  return request.put(`${environmentUrl}/${id}/status`)
}

export function getEnvironment(id, params) {
  return request.get(`${environmentUrl}/${id}/status`, { params })
}

// 存储器模板
const storageTemplateUrl = '/ims/v1/storages/template'
export function getStorageTemplate(params) {
  return request.get(storageTemplateUrl, {
    params
  })
}

export function createStorageTemplate(params) {
  return request.post(storageTemplateUrl, wrapperParams(params))
}

export function modifyStorageTemplate(params) {
  return request.put(`${storageTemplateUrl}/${params.id}`, wrapperParams(params))
}

export function removeStorageTemplate(id) {
  return request.delete(`${storageTemplateUrl}/${id}`)
}

export function storageTemplateDetail(id) {
  return request.get(`${storageTemplateUrl}/${id}`)
}

// Powervc 查询网络使用的SEA信息
const networkSeaUrl = '/ims/v1/networks'
export function getNetworkSea(id) {
  return request.get(`${networkSeaUrl}/${id}/seas`)
}

// 根据存储提供者查询存储池
const poolStorageUrl = '/ims/v1/storages'
export function poolStorage(id) {
  return request.get(`${poolStorageUrl}/${id}/pools`)
}

export function getStorageTemplates(params) {
  return request.post(storageTemplateUrl, wrapperParams(params))
}

export function getVendorStorageTemplates(params) {
  return request.get(storageTemplateUrl, {
    params
  })
}

export function getTemplate(params) {
  return request.get('/ims/v1/storages/template', {
    params
  })
}

export function vmVolume(params) {
  return request.get('/ims/v1/vms/volumes', { params: wrapperParams(params) })
}

export function volumeVm(params) {
  return request.get(`/ims/v1/volumes/${params.id}/vms`, { params })
}

export function getHmcHosts(params) {
  return request.get(`/ims/v1/powervc/hmcs/${params.hmcId}/hosts`, { params: wrapperParams(params) })
}

export function getHostVms(id, params) {
  return request.get(`/ims/v1/hosts/${id}/vms`, { params })
}

export function createHostVms(params) {
  return request.post(`/ims/v1/hosts/${params.id}/vms`, { ...wrapperParams(params), type: 'Powervc' })
}

export function deleteHostVms(params) {
  return request.delete(`/ims/v1/hosts/${params.id}/vms`, { params: wrapperParams(params), type: 'Powervc' })
}

export function putVmsImage(params) {
  return request.put(`/ims/v1/vms/${params.id}/images`, wrapperParams(params))
}

export function createVmsImage(params) {
  return request.post(`/ims/v1/vms/${params.id}/images`, wrapperParams(params))
}

export function getViosgroups(params) {
  return request.get('/ims/v1/powervc/viosgroups', { params: wrapperParams(params) })
}

export function getHmcVolumes(params) {
  return request.get('/ims/v1/volumes', { params })
}

export function getStoragesTemplageVolumes(params) {
  return request.get(`/ims/v1/storages/templates/${params.templateId}/volumes`, { params: wrapperParams(params) })
}

export function createHostVolumes(params) {
  return request.post(`/ims/v1/hosts/${params.storageId}/volumes`, { ...wrapperParams(params), type: 'Powervc' })
}

export function deleteHostVolumes(params) {
  return request.delete(`/ims/v1/hosts/${params.id}/volumes`, { params: wrapperParams(params), type: 'Powervc' })
}

export function createStoragesVolumes(params) {
  return request.post(`/ims/v1/storages/${params.storageId}/volumes`, wrapperParams(params))
}

export function deleteStoragesVolumes(params) {
  return request.delete(`/ims/v1/storages/${params.storageId}/volumes`, { params: wrapperParams(params) })
}

export function removeVm(params) {
  return request.delete(`/ims/v1/vms/${params.id}`, { params: wrapperParams(params) })
}

export function getPortVm(id, params) {
  return request.get(`/ims/v1/vms/${id}/ports`, { params })
}
