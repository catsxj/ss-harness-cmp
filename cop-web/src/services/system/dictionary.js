import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/sms/v1/dictionaries'
export function getDict(params) {
  return request.get(baseUrl, { params })
}

export function getDictChildren(params) {
  return request.get(`${baseUrl}/children`, { params })
}

export function getDictChildrenTree(params) {
  return request.get(`${baseUrl}/children/tree`, {
    params: wrapperParams(params)
  })
}
