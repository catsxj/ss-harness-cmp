import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/ims/v1/object/user'
export function getObjectUser(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createObjectUser(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyObjectUser(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeObjectUser(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function getObjectUserDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}

export function patchObjectUser(action, params) {
  return request.patch(`${baseUrl}/${params.objectUserId}`, {
    action: action,
    ...wrapperParams(params)
  })
}
