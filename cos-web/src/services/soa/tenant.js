/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

export function getDashboard(params) {
  return request.get('/cos/v1/soa/tenants/resources', {
    params: wrapperParams(params)
  })
}
export function getAz(params) {
  return request.get('/cos/v1/soa/tenants', {
    params: wrapperParams(params)
  })
}
export function exportTenant(params) {
  downloadFile('/cos/v1/soa/tenants/resources/download', params)
}
export function getReportTenants(params) {
  return request.get('/cos/v1/tenant/report/tenants/list', { params })
}
export function getVendorTenants(params) {
  return request.get('/cos/v1/tenant/report/vendor/list', { params })
}
export function getTenantResources(params) {
  return request.get('/cos/v1/tenant/report/tenants/resources', { params })
}
export function getTenantResourceList(params) {
  return request.get('/cos/v1/tenant/report/resource/list', { params })
}
