import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cms/v1/kubernetes'
export function getNode(params) {
  return request.get(`${baseUrl}/nodes`, {
    params: params
  })
}
export function getPod(params) {
  return request.get(`${baseUrl}/pods`, {
    params: params
  })
}
export function getNodeDetail(params) {
  return request.get(`${baseUrl}/nodes/overview`, {
    params: wrapperParams(params)
  })
}
export function getPodDetail(params) {
  return request.get(`${baseUrl}/pods/overview`, {
    params: wrapperParams(params)
  })
}
