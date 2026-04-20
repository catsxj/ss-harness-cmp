import request from 'utils/request'
import { wrapperParams } from 'utils'

const billUrl = '/cos/v1/bills'

export function getBills(params) {
  return request.get(billUrl, {
    params
  })
}
export function createBills(params) {
  return request.post(billUrl, wrapperParams(params))
}
export function modifyBills(params) {
  return request.put(`${billUrl}/${params.id}`, wrapperParams(params))
}
export function removeBills(id) {
  return request.delete(`${billUrl}/${id}`)
}
export function getBillsDetail(id) {
  return request.get(`${billUrl}/${id}`)
}
export function conditionBill(params) {
  return request.get(billUrl, { params })
}

export function getBillStats(params) {
  return request.get(`${billUrl}/stats`, {
    params: wrapperParams(params)
  })
}
export function getBillDashboard(params) {
  return request.get(`${billUrl}/dashboard`, {
    params: wrapperParams(params)
  })
}
export function operateBill(action, params) {
  return request.patch(`${billUrl}`, {
    action,
    ...params
  })
}

export function getCloudBills(params) {
  return request.get('/ims/v1/cloud/bills', {
    params
  })
}

const itemsUrl = '/cos/v1/bills/items'
export function getBillsItems(params) {
  return request.get(itemsUrl, {
    params
  })
}
export function createBillsItems(params) {
  return request.post(itemsUrl, wrapperParams(params))
}
export function getBillsItemsDetail(id) {
  return request.get(`${itemsUrl}/${id}`)
}
export function modifyBillsItems(params) {
  return request.put(`${itemsUrl}/${params.id}`, wrapperParams(params))
}
export function removeBillsItems(id) {
  return request.delete(`${itemsUrl}/${id}`)
}
const paymentsUrl = '/cos/v1/payments'
export function getPayments(params) {
  return request.get(paymentsUrl, {
    params
  })
}

export function getCloudBillsQuery(params) {
  return request.get('/ims/v1/cloud/bills/queryTypeList', { params: wrapperParams(params) })
}

export function syncCloudBills(params) {
  return request.post('/ims/v1/cloud/bills')
}
