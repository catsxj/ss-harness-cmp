import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/sms/v1/admissions'

export function getIpAccess(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getIpAccessDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createIpAccess(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function removeIpAccess(id) {
  return request.delete(`${baseUrl}/${id}`)
}
export function batchRemoveIpAccess(params) {
  return request.delete(`${baseUrl}`, {
    data: params
  })
}
export function getStrategies(params) {
  return request.get('/sms/v1/access/strategies', {
    params
  })
}
export function modifyStrategies(params) {
  return request.put(`/sms/v1/access/strategies/${params.id}`, wrapperParams(params))
}
