/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getDashboard(params) {
  return request.get('/cos/v1/soa/orders/dashboard', {
    params: wrapperParams(params)
  })
}
export function getVendorsAz(params) {
  return request.get('/cos/v1/soa/vendors/orders', {
    params: wrapperParams(params)
  })
}
export function getTenantsAz(params) {
  return request.get('/cos/v1/soa/tenants/orders', {
    params: wrapperParams(params)
  })
}
export function getRegionsAz(params) {
  return request.get('/cos/v1/soa/regions/orders', {
    params: wrapperParams(params)
  })
}
export function getStatusAz(params) {
  return request.get('/cos/v1/soa/orders/status', {
    params: wrapperParams(params)
  })
}
export function getTypesAz(params) {
  return request.get('/cos/v1/soa/orders/types', {
    params: wrapperParams(params)
  })
}
export function getResourcesAz(params) {
  return request.get('/cos/v1/soa/resources/orders', {
    params: wrapperParams(params)
  })
}
