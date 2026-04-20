import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/nms/v1/nsx/nat-rules'
export function getNat(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createNat(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyNat(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeNat(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function batchRemoveNat(params) {
  return request.delete(`${baseUrl}`, {
    data: wrapperParams(params)
  })
}

export function getNatDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
