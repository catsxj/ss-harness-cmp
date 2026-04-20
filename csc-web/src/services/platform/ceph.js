import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getCeph(params) {
  return request.get('/cms/v1/ceph/stats', { params })
}
export function getBytes(params) {
  return request.get('/cms/v1/prometheus', {
    params: wrapperParams(params)
  })
}
export function getIscsiPorts(params) {
  return request.get('/dms/v1/storages/iscsiports', {
    params: params
  })
}
export function deleteIscsiPorts(id) {
  return request.delete(`/dms/v1/storages/iscsiports/${id}`)
}
export function operateAcl(id, action) {
  return request.patch(`/dms/v1/storages/iscsiports/${id}`, {
    action: action
  })
}
export function operateIscsiPort(id, action, params) {
  return request.patch(`/dms/v1/storages/iscsiports/${id}`, {
    action: action,
    ...wrapperParams(params)
  })
}
export function getHostsByIscsiPort(params) {
  return request.get('/dms/v1/hosts', { params })
}
export function getHost(params) {
  return request.get('/dms/v1/hosts', { params })
}
export function createIscsiPort(params) {
  return request.post('/dms/v1/storages/iscsiports', wrapperParams(params))
}
export function getIscsiPortDetail(id) {
  return request.get(`/dms/v1/storages/iscsiports/${id}`)
}
export function getStorageHosts(params) {
  return request.get('/dms/v1/storages/hosts', {
    params: params
  })
}
export function createIscsiClients(params) {
  return request.post('/dms/v1/iscsi/clients', wrapperParams(params))
}
export function getHostVolumes(id, params) {
  return request.get(`/dms/v1/storages/hosts/${id}/volumes`, {
    params: params
  })
}
export function createHostVolumes(params) {
  return request.post(`/dms/v1/storages/hosts/${params.id}/volumes`, wrapperParams(params))
}
export function deleteHostVolumes(params) {
  return request.delete(`/dms/v1/storages/hosts/${params.id}/volumes`, { params: wrapperParams(params) })
}
// action=listByIScsiPort修改
export function getVolumesByPort(id, params) {
  return request.get(`/dms/v1/storages/hosts/${id}/volumes`, {
    params: params
  })
}
