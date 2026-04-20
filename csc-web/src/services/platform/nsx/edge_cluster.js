import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/nms/v1/nsx/edge-clusters'
export function getCluster(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createCluster(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyCluster(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeCluster(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function getClusterDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
