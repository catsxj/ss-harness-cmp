/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

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

export function getProperties(id) {
  return request.get(`/ams/v1/modules/${id}/properties`)
}
export function getPropertiesByCode(code) {
  return request.get('/ims/v1/properties', {
    params: wrapperParams({ code })
  })
}
// 模型关系维护
