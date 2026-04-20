import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/nms/v1/nsx/routers'
export function getRouter(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createRouter(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyRouter(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeRouter(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function batchRemoveRouter(params) {
  return request.delete(`${baseUrl}`, {
    data: wrapperParams(params)
  })
}

export function getRouterDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
