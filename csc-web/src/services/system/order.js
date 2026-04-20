/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams } from 'util'

const orderUrl = '/cos/v1/orders'

export function getOrder(params) {
  return request.get(orderUrl, {
    params
  })
}
export function createOrder(params) {
  return request.post(orderUrl, wrapperParams(params))
}
export function modifyOrder(params) {
  return request.put(`${orderUrl}/${params.id}`, wrapperParams(params))
}
export function removeOrder(id) {
  return request.delete(`${orderUrl}/${id}`)
}

export function getOrderDetail(id) {
  return request.get(`${orderUrl}/${id}`)
}

export function getOrderItems(params) {
  return request.get(`${orderUrl}/items`, {
    params
  })
}

export function conditionOrder(params) {
  return request.get(orderUrl, {
    params
  })
}
export function operateOrder(action, params) {
  return request.patch(`${orderUrl}`, {
    action,
    ...params
  })
}
export function getOrderCount() {
  return request.get('/cos/v1/orders/count')
}
