import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

export function getComputeReport(params) {
  return request.get('/rms/v1/operations/reports/computers', {
    params: wrapperParams(params)
  })
}
export function getResourceChart(params) {
  return request.get('/rms/v1/operations/reports', {
    params: wrapperParams(params)
  })
}
export function getTenantReport(params) {
  return request.get('/rms/v1/operations/reports/tenants', {
    params
  })
}
export function exportReport(params) {
  downloadFile('/rms/v1/operations/reports/download', {
    params: JSON.stringify(params)
  })
}
