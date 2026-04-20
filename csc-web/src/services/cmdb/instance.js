/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

export function getInstance(data) {
  return request.get('/ams/v1/instances', {
    params: data
  })
}
export function getInstanceDetail(id) {
  return request.get(`/ams/v1/instances/${id}`)
}
export function createInstance(params) {
  return request.post('/ams/v1/instances', wrapperParams(params))
}
export function modifyInstance(params) {
  return request.put(`/ams/v1/instances/${params.id}`, wrapperParams(params))
}
export function removeInstance(id) {
  return request.delete(`/ams/v1/instances/${id}`)
}
export function updateColumns(params) {
  return request.patch(`/ams/v1/modules/${params.moduleId}/columns`, wrapperParams(params))
}
// 获取实例关系
export function getInstanceRelation(params) {
  return request.get(`/ams/v1/instances/${params.id}/relations`, {
    params: wrapperParams(params)
  })
}
export function createInstanceRelation(insanceId, params) {
  return request.put(`/ams/v1/instances/${insanceId}/relations`, wrapperParams(params))
}
export function getInstanceTopology(instanceId, params) {
  if (instanceId) {
    return request.get('/ims/v1/instances/topology', {
      params
    })
  }
  return request.get('/ims/v1/instances/topology', {
    params
  })
}
// 获取实例变更历史
export function getInstanceHistory(instanceId, params) {
  return request.get(`/ams/v1/instances/${instanceId}/history`, {
    params: params
  })
}
export function downloadTemplate(moduleId, params) {
  downloadFile(`/ams/v1/modules/${moduleId}/template`, { params })
}
export function updateLocation(instanceId, params) {
  return request.patch(`/ims/v1/instances/${instanceId}/topology/coordinates`, wrapperParams(params))
}
