/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/sms/v1/systems'
export function getSystems(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getSystemsDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createSystems(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifySystems(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeSystems(id) {
  return request.delete(`${baseUrl}/${id}`)
}
