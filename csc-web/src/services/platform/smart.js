import request from 'utils/request'
import { wrapperParams } from 'utils'

export function createVmsTpl(params) {
  return request.post('/ims/v1/vms/templates', wrapperParams(params))
}
export function modifyTpl(params) {
  return request.put(`/ims/v1/vms/templates/${params.id}`, wrapperParams(params))
}

export function removeTpl(params) {
  return request.delete(`/ims/v1/vms/templates/${params.id}?vendorId=${params.vendorId}`)
}
export function createTplVm(params) {
  return request.patch(`/ims/v1/vms/templates/${params.id}`, wrapperParams(params))
}
const switchUrl = '/ims/v1/switchers'
export function getSwitchers(params) {
  return request.get(switchUrl, {
    params: params
  })
}
export function createSwitchers(params) {
  return request.post(switchUrl, wrapperParams(params))
}
export function modifySwitchers(params) {
  return request.put(`${switchUrl}/${params.id}`, wrapperParams(params))
}
export function removeSwitchers(id) {
  return request.delete(`${switchUrl}/${id}`)
}
const volumeTplUrl = '/ims/v1/storages/template'
export function getVolumeTpl(params) {
  return request.get(volumeTplUrl, {
    params: params
  })
}
export function createVolumeTpl(params) {
  return request.post(volumeTplUrl, wrapperParams(params))
}
export function modifyVolumeTpl(params) {
  return request.put(`${volumeTplUrl}/${params.id}`, wrapperParams(params))
}
export function detailVolumeTpl(id) {
  return request.get(`${volumeTplUrl}${id}`)
}
export function removeVolumeTpl(id) {
  return request.delete(`${volumeTplUrl}/${id}`)
}
export function getDisks(params) {
  return request.get('/ims/v1/storages/disks', {
    params: params
  })
}
export function getVolume(id, params) {
  return request.get(`/ims/v1/vms/${id}/volumes`, {
    params: params
  })
}
export function getVmByImage(id, params) {
  return request.get(`/ims/v1/images/${id}/servers`, {
    params: params
  })
}
export function getSnapshotByVolume(id, params) {
  return request.get(`/ims/v1/volumes/${id}/snapshots`, {
    params: params
  })
}
export function getVolumesVms(id, params) {
  return request.get(`/ims/v1/volumes/${id}/vms`, { params })
}
