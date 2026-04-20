import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/ims/v1/object/router'
export function getObjectRouter(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createObjectRouter(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyObjectRouter(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeObjectRouter(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function getObjectRouterDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
