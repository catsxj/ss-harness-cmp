import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

export function getHosts(params) {
  return request.get('/cop/v1/hosts', { params })
}

export function getHostDetail(id) {
  return request.get(`/cop/v1/hosts/${id}`)
}

export function createHost(params) {
  return request.post('/cop/v1/hosts', params)
}
export function syncHostFromIms(category) {
  return request.post(`/cop/v1/hosts/${category}/syncFromIms`)
}

export function updateBsmHost(params) {
  return request.put(`/cop/v1/hosts/${params.id}`, params)
}
export function deleteBsmHost(id) {
  return request.delete(`/cop/v1/hosts/${id}`)
}
export function getBsmHostDetail(id) {
  return request.get(`/cop/v1/hosts/${id}`)
}
export function synHost(category) {
  return request.post(`/cop/v1/hosts/${category}/sync`)
}
export function HostsAllow(hostId) {
  return request.post(`/cop/v1/hosts/${hostId}/allow/config`)
}
export function getBsmHostGroup(params) {
  return request.get('/cop/v1/network/groups', { params })
}
export function createBsmHostGroup(params) {
  return request.post('/cop/v1/network/groups', params)
}
export function updateBsmHostGroup(params) {
  return request.put(`/cop/v1/network/groups/${params.id}`, params)
}
export function deleteBsmHostGroup(id) {
  return request.delete(`/cop/v1/network/groups/${id}`)
}
export function getBsmHostNetwork(params) {
  return request.get('/cop/v1/network/segments', { params })
}
export function createBsmHostNetwork(params) {
  return request.post('/cop/v1/network/segments', params)
}
export function updateBsmHostNetwork(params) {
  return request.put(`/cop/v1/network/segments/${params.id}`, params)
}
export function deleteBsmHostNetwork(id) {
  return request.delete(`/cop/v1/network/segments/${id}`)
}
export function getBsmHostNetworkDetail(id) {
  return request.get(`/cop/v1/network/segments/${id}`)
}
export function getWorkers(params) {
  return request.get('/cop/v1/task/workers', { params })
}
export function createBsmHostWorker(params) {
  return request.post('/cop/v1/task/workers', params)
}
export function updateBsmHostWorker(params) {
  return request.put(`/cop/v1/task/workers/${params.id}`, params)
}
export function deleteBsmHostWorker(id) {
  return request.delete(`/cop/v1/task/workers/${id}`)
}
export function setBsmHostWorker(params) {
  return request.put(`/cop/v1/task/workers/${params.workerId}/configure/${params.groupId}`, params)
}
export function setBsmHostSegment(params) {
  return request.put(`/cop/v1/hosts/${params.hostId}/configure/${params.segmentId}`, params)
}
export function getWorkerDetail(id) {
  return request.get(`/cop/v1/task/workers/${id}`)
}
export function getBsmNetworkSegmentsHostsCount(id) {
  return request.get(`/cop/v1/network/segments/${id}/hosts/count`)
}
export function setBsmNetworkSegmentsInspect(params) {
  return request.post(`/cop/v1/network/segments/${params.id}/inspect`, params)
}
export function getBsmHostStats(params) {
  return request.get('/cop/v1/hosts/stats', { params })
}
export function getBsmHostSegmentsStats(params) {
  return request.get('/cop/v1/hosts/segments/stats', { params })
}
export function getBsmHostInspectionsRecords(params) {
  return request.get('/cop/v1/hosts/inspections/records', { params })
}
export function setBsmHostsInspect(params) {
  return request.post(`/cop/v1/hosts/${params.id}/inspect`, params)
}
export function createBsmHostsDownload() {
  downloadFile('/cop/v1/hosts/template/download')
}
