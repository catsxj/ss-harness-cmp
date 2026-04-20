import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/sms/v1/dictionaries'
export function getDict(params) {
  return request.get(baseUrl, { params })
}

export function createDict(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyDict(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeDict(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function detailDict(id) {
  return request.get(`${baseUrl}/${id}`)
}

export function getDictChildren(params) {
  return request.get(`${baseUrl}/children`, { params })
}

export function getDictChildrenTree(params) {
  return request.get(`${baseUrl}/children/tree`, {
    params: wrapperParams(params)
  })
}
