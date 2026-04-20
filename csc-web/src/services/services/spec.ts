/**
 * Created by HaijunZhang on 2019/5/10.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils/index'
// sku操作
export function getSku(params: Base.IListParams) {
  return request.get('/cos/v1/services/skus', {
    params: params
  })
}
export function getSkuDetail(id: number) {
  return request.get(`/cos/v1/services/skus/${id}`)
}
export function removeSku(id: number) {
  return request.delete(`/cos/v1/services/skus/${id}`)
}
export function createSku(params: any) {
  return request.post('/cos/v1/services/skus', wrapperParams(params))
}
export function modifySku(params: any) {
  return request.put(`/cos/v1/services/skus/${params.id}`, wrapperParams(params))
}
// 批量上下架
export function batchOperateSku(ids: number[], action: string) {
  return request.patch('/cos/v1/services/skus/batch', { action, ids })
}
// 租户授权服务
export function tenantGrantService(params: any) {
  return request.post('/cos/v1/services/tenants/grantservices', wrapperParams(params))
}
// 服务授权租户
export function serviceGrantTenant(serviceId: number, tenantIds: any) {
  return request.post(`/cos/v1/services/${serviceId}/grant`, tenantIds)
}
export function removeServiceTenant(id: number) {
  return request.delete(`/cos/v1/services/tenants/${id}`)
}
// 服务授权租户 多对对
export function serviceGrantBatch(params: any) {
  return request.post('/cos/v1/services/tenants/grantbatch', wrapperParams(params))
}
// 获取服务下的租户
export function getTenantByservice(id: number) {
  return request.get(`/cos/v1/services/${id}/tenants`)
}
// 使用记录
export function serviceRecord(params: any) {
  return request.get('/cos/v1/services/usages', {
    params: params
  })
}
// 实用统计
export function serviceStatistics(params: any) {
  return request.get('/cos/v1/services/usages/statistics', {
    params: wrapperParams(params)
  })
}
export function getCategory(params: any) {
  return request.get('/cos/v1/services/categories', {
    params: params
  })
}
export function createCategory(params: any) {
  return request.post('/cos/v1/services/categories', wrapperParams(params))
}
export function modifyCategory(params: any) {
  return request.put(`/cos/v1/services/categories/${params.id}`, wrapperParams(params))
}
export function removeCategory(id: number) {
  return request.delete(`/cos/v1/services/categories/${id}`)
}
export function getCatalog(params: any) {
  return request.get('/cos/v1/services/catalogs', {
    params
  })
}
export function getCatalogDetail(id: number) {
  return request.get(`/cos/v1/services/catalogs/${id}`)
}

export function getServiceByCode(code: any, tenantId?: number) {
  return request.get(`/cos/v1/services/catalogs/${code}/services`, {
    params: { tenantId }
  })
}
