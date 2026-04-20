import request from 'utils/request'

const baseUrl = '/sms/v1/upgrade'

export function getMeta() {
  return request.get(`${baseUrl}/datasource`)
}

export function migrationData(params) {
  return request.post(`${baseUrl}/datasource`, params)
}

export function migrationById(recordId, taskId) {
  return request.post(`${baseUrl}/records/${recordId}/tasks/${taskId}`)
}

export function getMigrationData(params) {
  return request.get(`${baseUrl}/records`, { params })
}

export function getDetail(id) {
  return request.get(`${baseUrl}/records/${id}`)
}

export function getDetailList(id, params) {
  return request.get(`${baseUrl}/records/${id}/tasks`, { params })
}
