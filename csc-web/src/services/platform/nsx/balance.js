import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/nms/v1/nsx/lb-services'
export function getLb(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createLb(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyLb(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeLb(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function batchRemoveLb(params) {
  return request.delete(`${baseUrl}`, {
    data: wrapperParams(params)
  })
}

export function getLbDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
