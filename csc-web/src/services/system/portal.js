/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cos/v1/portal'
export function getPanel(params) {
  return request.get(`${baseUrl}/panels`, {
    params: wrapperParams(params)
  })
}
export function savePanel(params) {
  return request.patch(`${baseUrl}/panels`, wrapperParams(params))
}
export function getPool(params) {
  return request.get(`${baseUrl}/elementpools`, {
    params: wrapperParams(params)
  })
}
export function getConfig(params) {
  return request.get(`${baseUrl}/elements`, {
    params: wrapperParams(params)
  })
}
export function getPlatformStats(params) {
  return request.get('/ims/v1/portal/platform/stats', {
    params: wrapperParams(params)
  })
}
export function getVendorStats(params) {
  return request.get('/ims/v1/portal/vendor/stats', {
    params: wrapperParams(params)
  })
}
export function getTaskStats(params) {
  return request.get('/cop/v1/task/stats', {
    params: wrapperParams(params)
  })
}
export function getVmServiceTrend(params) {
  return request.get('/cos/v1/portal/platform/statisticsOfComputer', {
    params: wrapperParams(params)
  })
}
export function getCharge(params) {
  return request.get('/cmc/portal/charge/stats', {
    params: wrapperParams(params)
  })
}
