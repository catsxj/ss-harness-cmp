import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/nms/v1/nsx/router-ports'
export function getPort(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createPort(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyPort(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removePort(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function getPortDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
