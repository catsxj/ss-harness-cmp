/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

// 关系维度维护
export function getCategory(params) {
  return request.get('/ims/v1/instances/categories', {
    params: wrapperParams(params)
  })
}
export function createCategory(params) {
  return request.post('/ams/v1/relation/categories', wrapperParams(params))
}
export function modifyCategory(params) {
  return request.put(`/ams/v1/relation/categories/${params.id}`, wrapperParams(params))
}
export function removeCategory(id) {
  return request.delete(`/ams/v1/relation/categories/${id}`)
}
// 关系维护
export function getRelation(params) {
  return request.get('/ams/v1/relations', {
    params: wrapperParams(params)
  })
}
export function createRelation(params) {
  return request.post('/ams/v1/relations', wrapperParams(params))
}
export function modifyRelation(params) {
  return request.put(`/ams/v1/relations/${params.id}`, wrapperParams(params))
}
export function removeRelation(id) {
  return request.delete(`/ams/v1/relations/${id}`)
}
