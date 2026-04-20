import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/dms/v1/fabrics/zones'
export function getZone(params) {
  return request.get(baseUrl, {
    params: params
  })
}
export function getZoneDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createZone(action, params) {
  return request.post(baseUrl, {
    action: action,
    ...wrapperParams(params)
  })
}
export function modifyZone(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeZone(id) {
  return request.delete(`${baseUrl}/${id}`)
}
export function getZoneMember(id, params) {
  return request.get(`${baseUrl}/${id}/members`, {
    params: params
  })
}
// action修改
export function getZoneMemberByPort(id, params) {
  return request.get(`${baseUrl}/${id}/ports`, {
    params: params
  })
}
export function getZoneMemberByWwn(id, params) {
  return request.get(`${baseUrl}/${id}/wwns`, {
    params: params
  })
}
export function getZoneMemberByAlias(id, params) {
  return request.get(`${baseUrl}/${id}/aliases`, {
    params: params
  })
}
const switchUrl = '/dms/v1/fabrics'
export function getSwitches(params) {
  return request.get(switchUrl, {
    params: params
  })
}
export function getSwitchesDetail(id) {
  return request.get(`${switchUrl}/${id}`)
}
export function createSwitches(params) {
  return request.post(switchUrl, wrapperParams(params))
}
export function modifySwitches(params) {
  return request.put(`${switchUrl}/${params.id}`, wrapperParams(params))
}
export function removeSwitches(id) {
  return request.delete(`${switchUrl}/${id}`)
}
// vsan
export function getVsan(params) {
  return request.get(`${switchUrl}/vsans`, {
    params: params
  })
}
export function getVsanDetail(id) {
  return request.get(`${switchUrl}/vsans/${id}`)
}
// 端口
export function getPort(params) {
  return request.get(`${switchUrl}/ports`, {
    params: params
  })
}
// zoneset
export function getZoneset(params) {
  return request.get(`${switchUrl}/zonesets`, {
    params: params
  })
}
export function getZonesetDetail(id) {
  return request.get(`${switchUrl}/zonesets/${id}`)
}
export function getZoneSetZone(id, params) {
  return request.get(`${switchUrl}/zonesets/${id}/zones`, {
    params: params
  })
}
