import request from 'utils/request'
import { wrapperParams } from 'utils/index'

const billUrl = '/cos/v1/bills'

export function getCategories(params) {
  return request.get('/cos/v1/services/categories/condition', {
    params
  })
}
export function getCategoriesByCode(serviceCode) {
  return request.get(`/cos/v1/cloud/services/${serviceCode}/categories`)
}
export function getSkus(params) {
  return request.get('/cos/v1/services/skus/condition', {
    params
  })
}
export function getSkusDetail(id) {
  return request.get(`/cos/v1/services/skus/${id}`)
}

export function getPrices(params) {
  return request.get('/cos/v1/skus/prices', {
    params
  })
}
export function getSlaDetail(id) {
  return request.get(`cos/v1/services/slas/${id}`)
}
export function applyResource(params) {
  return request.post('/cos/v1/resource/application', wrapperParams(params))
}
export function applyResourceEFC(params) {
  return request.post('/cos/v1/resource/efc/application', wrapperParams(params))
}
export function deleteApplyResource(params) {
  return request.delete('/cos/v1/resources/applies', { params: wrapperParams(params) })
}
export function modifyResource(params) {
  return request.post('/cos/v1/resource/alteration', wrapperParams(params))
}
export function modifyResourceEFC(params) {
  return request.post('/cos/v1/resource/efc/alteration', wrapperParams({ workOrderTypeCode: 'CloudServerAlteration', ...params }))
}
export function applyResourceSnapshot(params) {
  return request.post('/cos/v1/resource/applications', wrapperParams(params))
}
// 获取VPC列表
export function getVpc(params) {
  return request.get('/ims/v1/nsx/routers', {
    params
  })
}
// 服务退订
export function unsubscribeService(params) {
  return request.post('/cos/v1/resource/cancelation', wrapperParams(params))
}
// 服务退订
export function unsubscribeServiceEFC(params) {
  return request.post('/cos/v1/resource/efc/cancelation', wrapperParams({ workOrderTypeCode: 'CloudServerCancelation', ...params }))
}
// 服务退订
export function newunsubscribeServices(params) {
  return request.post('/cos/v1/resource/efc/cancelation', wrapperParams(params))
}
// 服务延期
export function delayService(params) {
  return request.post('/cos/v1/resource/extension', wrapperParams(params))
}

// 服务延期
export function delayServiceEFC(params) {
  return request.post('/cos/v1/resource/efc/extension', wrapperParams(params))
}
// 批量退订
export function unsubscribeServices(params) {
  return request.post('/cos/v1/resource/batch/cancelation', wrapperParams(params))
}
