import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/dms/v1/storages/files/users'
export function getFileUser(params) {
  return request.get(baseUrl, {
    params
  })
}
// condition修改
export function getUserbyExclude(id) {
  return request.get(`${baseUrl}/groups/${id}/users/exclude`)
}
export function getUserbyInclude(id) {
  return request.get(`${baseUrl}/groups/${id}/users/include`)
}
export function createFileUser(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyFileUser(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeFileUser(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function getFileUserDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}

export function patchFileUser(action, params) {
  return request.patch(`${baseUrl}/${params.FileUserId}`, {
    action: action,
    ...wrapperParams(params)
  })
}

const baseUrls = '/dms/v1/storages/files/users/groups'
export function getFileUserGroups(params) {
  return request.get(baseUrls, {
    params
  })
}

export function createFileUserGroups(params) {
  return request.post(baseUrls, wrapperParams(params))
}

export function modifyFileUserGroups(params) {
  return request.put(`${baseUrls}/${params.id}`, wrapperParams(params))
}

export function removeFileUserGroups(id) {
  return request.delete(`${baseUrls}/${id}`)
}

export function getFileUserDetailGroups(id) {
  return request.get(`${baseUrls}/${id}`)
}

export function patchFileUserGroups(action, params) {
  return request.patch(`${baseUrls}/${params.id}`, {
    action: action,
    ...wrapperParams(params)
  })
}
