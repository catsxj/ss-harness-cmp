import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/nms/v1/nsx/virtual-servers'
export function getVs(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createVs(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyVs(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeVs(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function batchRemoveVs(params) {
  return request.delete(`${baseUrl}`, {
    data: wrapperParams(params)
  })
}

export function getVsDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
