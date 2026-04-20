import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cos/v1/services/providers'
// 服务平台
export function getProvider(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getProviderDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createProvider(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyProvider(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeProvider(id) {
  return request.delete(`${baseUrl}/${id}`)
}
const operateUrl = '/cos/v1/services/operations'
export function getOperate(params) {
  return request.get(operateUrl, {
    params
  })
}
// 服务操作
export function getOperateDetail(id) {
  return request.get(`${operateUrl}/${id}`)
}
export function createOperate(params) {
  return request.post(operateUrl, wrapperParams(params))
}
export function modifyOperate(params) {
  return request.put(`${operateUrl}/${params.id}`, wrapperParams(params))
}
export function removeOperate(id) {
  return request.delete(`${operateUrl}/${id}`)
}
