/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

const roleUrl = '/sms/v1/roles'

export function getRole(params) {
  return request.get(roleUrl, {
    params
  })
}
export function getRoleDetail(id) {
  return request.get(`${roleUrl}/${id}`)
}
export function createRole(params) {
  return request.post(roleUrl, wrapperParams(params))
}
export function modifyRole(params) {
  return request.put(`${roleUrl}/${params.id}`, wrapperParams(params))
}
export function removeRole(id) {
  return request.delete(`${roleUrl}/${id}`)
}
export function getRoleAuth(id, params) {
  return request.get(`${roleUrl}/${id}/permissions`, {
    params: params
  })
}
export function accreditRole(id, params) {
  return request.patch(`${roleUrl}/${id}`, params)
}
export function getModules() {
  return request.get('/sms/v1/permissions/modules')
}
export function getModulesByName(name) {
  return request.get(`/sms/v1/permissions/modules/${name}`)
}
export function getApiById(roleId, params) {
  return request.get(`/sms/v1/roles/${roleId}/apis`, {
    params: params
  })
}
export function updateApi(roleId, params) {
  return request.patch(`/sms/v1/roles/${roleId}/apis`, params)
}
