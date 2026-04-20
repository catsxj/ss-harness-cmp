/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getAuth(params) {
  return request.get('/sms/v1/permissions/tree', {
    params: wrapperParams(params)
  })
}
export function getAuthByCategory(params) {
  return request.get('/sms/v1/permissions', {
    params: wrapperParams(params)
  })
}
export function getAuthDetail(id) {
  return request.get(`/sms/v1/permissions/${id}`)
}
export function createAuth(params) {
  return request.post('/sms/v1/permissions', wrapperParams(params))
}
export function modifyAuth(params) {
  return request.put(`/sms/v1/permissions/${params.id}`, wrapperParams(params))
}
export function removeAuth(id) {
  return request.delete(`/sms/v1/permissions/${id}`)
}
