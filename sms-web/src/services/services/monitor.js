import request from 'utils/request'

const baseUrl = '/cms//v1/monitor/resourcetype'
export function getMonitorSettings(params) {
  return request.get(baseUrl, { params })
}

export function createMonitorSetting(params) {
  return request.post(baseUrl, params)
}

export function updateMonitorSetting(params, id) {
  return request.put(`${baseUrl}/${id}`, params)
}

export function deleteMonitorSetting(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function deleteAllMonitorSetting(ids) {
  return request.delete(`${baseUrl}/remove`, { data: ids })
}

const metricUrl = '/cms/v1/metrics'
export function getMonitorList(params) {
  return request.get(`${metricUrl}/monitor/list`, { params })
}

export function createMetric(params) {
  return request.post(metricUrl, params)
}

export function updateMetric(params, id) {
  return request.put(`${metricUrl}/${id}`, params)
}

export function deleteMetric(id) {
  return request.delete(`${metricUrl}/${id}`)
}

export function getMonitorIds(params) {
  return request.get('/cms/v1/metrics/state/ids', { params })
}

export function bindMonitorList(params) {
  return request.post('/cms/v1/monitor/resourcetype/binding/metrics', params)
}
