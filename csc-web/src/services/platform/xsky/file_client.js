import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/dms/v1/storages/files/clients'
export function getFileClient(params) {
  return request.get(baseUrl, {
    params
  })
}
// condition修改
export function getClientbyExclude(id) {
  return request.get(`${baseUrl}/groups/${id}/clients/exclude`)
}
export function getClientbyInclude(id) {
  return request.get(`${baseUrl}/groups/${id}/clients/include`)
}

export function createFileClient(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyFileClient(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeFileClient(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function getFileClientDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}

export function patchFileClient(action, params) {
  return request.patch(`${baseUrl}/${params.FileClientId}`, {
    action: action,
    ...wrapperParams(params)
  })
}

const baseUrls = '/dms/v1/storages/files/clients/groups'
export function getFileClientGroups(params) {
  return request.get(baseUrls, {
    params
  })
}

export function createFileClientGroups(params) {
  return request.post(baseUrls, wrapperParams(params))
}

export function modifyFileClientGroups(params) {
  return request.put(`${baseUrls}/${params.id}`, wrapperParams(params))
}

export function removeFileClientGroups(id) {
  return request.delete(`${baseUrls}/${id}`)
}

export function getFileClientDetailGroups(id) {
  return request.get(`${baseUrls}/${id}`)
}

export function patchFileClientGroups(action, params) {
  return request.patch(`${baseUrls}/${params.id}`, {
    action: action,
    ...wrapperParams(params)
  })
}
