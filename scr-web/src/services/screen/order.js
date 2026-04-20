import request from 'utils/request'

export function getDashboard(params) {
  return request.get('/cos/v1/soa/orders/dashboard', {
    params
  })
}
export function getTenantsOrder(params) {
  return request.get('/cos/v1/soa/tenants/orders', {
    params
  })
}
export function getVendorTypeOrder(params) {
  return request.get('/cos/v1/soa/orders/types', {
    params
  })
}
export function getVendorOrder(params) {
  return request.get('/cos/v1/soa/vendors/orders', {
    params
  })
}
