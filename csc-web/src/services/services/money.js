import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const priceUrl = '/cos/v1/prices'

export function getPrices(params) {
  return request.get(priceUrl, {
    params
  })
}
export function createPrices(params) {
  return request.post(priceUrl, wrapperParams(params))
}
export function modifyPrices(params) {
  return request.put(`${priceUrl}/${params.id}`, wrapperParams(params))
}
export function removePrices(id) {
  return request.delete(`${priceUrl}/${id}`)
}
export function getPricesHistory(id, params) {
  return request.get(`${priceUrl}/${id}/history`, {
    params
  })
}
export function createPricesVendor(params) {
  return request.post(`${priceUrl}/vendors`, wrapperParams(params))
}
const billUrl = '/cos/v1/bills'
export function getBills(params) {
  return request.get(billUrl, {
    params
  })
}
export function removeBills(id) {
  return request.delete(`${billUrl}/${id}`)
}

export function getBillsSummary(params) {
  return request.get(`${billUrl}/summary`, {
    params: wrapperParams(params)
  })
}
export function getBillsTrend(params) {
  return request.get(`${billUrl}/trend`, {
    params: wrapperParams(params)
  })
}
export function getMeteringSummary(params) {
  return request.get('/cos/v1/metering/summary', {
    params: wrapperParams(params)
  })
}
export function getMeteringTrend(params) {
  return request.get('/cos/v1/metering/trend', {
    params: wrapperParams(params)
  })
}

const orderUrl = '/cos/v1/orders'

export function getOrders(params) {
  return request.get(orderUrl, {
    params
  })
}
export function removeOrders(id) {
  return request.delete(`${orderUrl}/${id}`)
}
export function getOrdersDetail(id) {
  return request.get(`${orderUrl}/${id}`)
}
export function getOrdersItem(id) {
  return request.get(`${orderUrl}/${id}/items`)
}

export function exportMoney(params) {
  downloadFile('/cos/v1/bills/export', { params })
}
