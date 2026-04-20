import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getOverview (type) {
  return request.get('/cos/v1/cloud/resource/overview', { params: { type } })
}
export function getPlatformOverview (type) {
  return request.get('/cos/v1/cloud/resource', { params: { type } })
}

export function getUsed (type) {
  return request.get('/cos/v1/cloud/resource/used', { params: { type } })
}

export function getVendors () {
  return request.get('/cos/v1/cloud/resource/type')
}

export function getPlatforms (type) {
  return request.get('/cos/v1/cloud/resource/platform', { params: wrapperParams({ type }) })
}

export function getAlarmPieChart() {
  return request.get('/cms/v1/alarms/chart', {
    params: { action: 'pieChart' }
  })
}

export function getResourceApply (type) {
  return request.get('/cos/v1/cloud/resource/apply', { params: { type } })
}

export function getResourceTrend (type) {
  return request.get('/cos/v1/cloud/resource/trend', { params: { type } })
}

// 资源利用率TOP5
export function getResTops(params) {
  return request.get('/cms/v1/tops', {
    params
  })
}

export function getVendorTypes() {
  return request.get('/cos/v1/cloud/resource/types')
}
export function getHostStatus(type) {
  return request.get('/cos/v1/cloud/resource/status', {
    params: { type }
  })
}
export function getResourceCount(type) {
  return request.get('/cos/v1/cloud/resource/count', {
    params: { type }
  })
}
