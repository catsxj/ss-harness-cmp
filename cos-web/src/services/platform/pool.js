import request from 'utils/request'
import { wrapperParams } from 'utils/index'

const baseUrl = '/ims/v1/pool/groups'

export function getPool(params, options = {}) {
  return request.get(baseUrl, {
    params,
    ...options
  })
}
export function getPoolConditions(params) {
  return request.get(`${baseUrl}/condition`, {
    params
  })
}
export function getPoolCondition(params) {
  return request.get(`${baseUrl}/condition`, {
    params: { condition: JSON.stringify(params) }
  })
}
export function getPoolDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createPool(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyPool(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removePool(id) {
  return request.delete(`${baseUrl}/${id}`)
}
export function createLabel(params) {
  return request.post(`${baseUrl}/labels`, wrapperParams(params))
}
export function removeLabel(id, params) {
  return request.delete(`${baseUrl}/${id}/labels`, {
    data: wrapperParams(params)
  })
}
export function getLabels(params) {
  return request.get(`${baseUrl}/labels`, {
    params: wrapperParams(params)
  })
}
export function createRelation(id, params) {
  return request.post(`${baseUrl}/${id}/releation`, wrapperParams(params))
}
export function removeRelation(id, params) {
  return request.delete(`${baseUrl}/${id}/releation`, {
    params
  })
}

export function conditionPool(params) {
  return request.get(`${baseUrl}/condition`, { params })
}

export function conditionPoolQueryByType(params) {
  return request.get(`${baseUrl}/queryByType`, { params })
}
export function patchPool(ids, status) {
  return request.patch(
    `${baseUrl}`,
    wrapperParams({
      action: status,
      ids
    })
  )
}

export function getPoolCapacity(id) {
  return request.get(`${baseUrl}/${id}/capacity`)
}

export function modifyPoolResource(params) {
  return request.patch(`${baseUrl}/${params.poolgroupId}/resources`, wrapperParams(params))
}
