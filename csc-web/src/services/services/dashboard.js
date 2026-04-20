import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getAccountInfos(tenantId) {
  return request.get(`/cos/v1/tenants/${tenantId}/account`)
}

export function getMonthData(condition) {
  return request.get('/cos/v1/bills/condition', { params: { condition } })
}

export function getPendingData() {
  return request.get('/cos/v1/soa/todo/count')
}

export function getWarningData(params) {
  return request.get('/cms/v1/alarms/chart', {
    params: { action: 'pieChart', ...wrapperParams(params) }
  })
}

export function getOrderStatus(params) {
  return request.get('/cos/v1/soa/orders/dashboard', { params })
}
