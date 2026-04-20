/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cos/v1/promotions'
export function getPromotions(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getPromotionsDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createPromotions(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyPromotions(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removePromotions(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function assignPromotionsTenant(id, params) {
  return request.post(`${baseUrl}/${id}/coupons`, wrapperParams(params))
}

export function conditionPromotions(params) {
  return request.get(baseUrl, { params })
}

export function patchPromotions(action, id) {
  return request.patch(`${baseUrl}/${id}`, {
    action: action
  })
}

export function getHistoryPromotions(params, id) {
  return request.get(`/cos/v1/promotions/${id}/auditrecords`, {
    params: params
  })
}

const couponsUrl = '/cos/v1/coupons'
export function getCoupons(params) {
  return request.get(couponsUrl, {
    params
  })
}
export function getCouponsDetail(id) {
  return request.get(`${couponsUrl}/${id}`)
}
export function createCoupons(params) {
  return request.post(couponsUrl, wrapperParams(params))
}
export function modifyCoupons(params) {
  return request.put(`${couponsUrl}/${params.id}`, wrapperParams(params))
}
export function removeCoupons(id) {
  return request.delete(`${couponsUrl}/${id}`)
}

export function conditionCoupons(params) {
  return request.get(couponsUrl, { params })
}
