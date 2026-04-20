/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getModuleCategory() {
  return request.get('/ams/v1/categories')
}
export function getModuleTree(data) {
  return request.get('/ams/v1/modules/structure', {
    params: wrapperParams(data)
  })
}
export function getModule(data) {
  return request.get('/ams/v1/modules', {
    params: wrapperParams(data)
  })
}
export function getModuleDetail(id) {
  return request.get(`/ams/v1/modules/${id}`)
}
export function createModule(params) {
  return request.post('/ams/v1/modules', wrapperParams(params))
}
export function modifyModule(params) {
  return request.put(`/ams/v1/modules/${params.id}`, wrapperParams(params))
}
export function removeModule(id) {
  return request.delete(`/ams/v1/modules/${id}`)
}
// 模型属性
export function saveProperties(params) {
  return request.put(`/ams/v1/modules/${params.moduleId}/properties`, wrapperParams(params))
}
export function getProperties(id) {
  return request.get(`/ams/v1/modules/${id}/properties`)
}
export function getPropertiesByCode(code) {
  return request.get('/ims/v1/properties', {
    params: wrapperParams({ code })
  })
}
// 模型关系维护
export function getModuleRelation(data) {
  return request.get(`/ams/v1/modules/${data.id}/topology`, {
    params: wrapperParams(data)
  })
}
export function createModuleRelation(muduleId, params) {
  return request.post(`/ams/v1/modules/${muduleId}/relations`, wrapperParams(params))
}
export function removeModuleRelation(moduleId, relationId) {
  return request.delete(`/ams/v1/modules/${moduleId}/relations/${relationId}`)
}
export function validateRemoveRelation(moduleId, relationId) {
  return request.patch(`/ams/v1/modules/${moduleId}/relations/${relationId}`)
}
