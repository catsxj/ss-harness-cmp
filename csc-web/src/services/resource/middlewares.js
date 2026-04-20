import request from 'utils/request'
import { wrapperParams } from 'utils'
const baseAssUrl = '/pms/v1/ass'
export function getAss(params) {
  return request.get(baseAssUrl, { params })
}

export function getAssDetail(id) {
  return request.get(`${baseAssUrl}/${id}`)
}

export function deleteAss(id) {
  return request.delete(`${baseAssUrl}/${id}`)
}

const baseLbsUrl = '/pms/v1/lbs'
export function getLbs(params) {
  return request.get(baseLbsUrl, { params })
}

export function getLbsDetail(id) {
  return request.get(`${baseLbsUrl}/${id}`)
}

export function deleteLbs(id) {
  return request.delete(`${baseLbsUrl}/${id}`)
}

const baseCcsUrl = '/pms/v1/ccs'
export function getCcs(params) {
  return request.get(baseCcsUrl, { params })
}

export function getCcsDetail(id) {
  return request.get(`${baseCcsUrl}/${id}`)
}

export function deleteCcs(id) {
  return request.delete(`${baseCcsUrl}/${id}`)
}
