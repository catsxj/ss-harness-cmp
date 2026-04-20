import request from 'utils/request'

const baseUrl = '/rms/v1/datasources'
export function getDataSource(params) {
  return request.get(baseUrl, { params })
}

export function createDataSource(params) {
  return request.post(baseUrl, params)
}

export function updateDataSource(params, id) {
  return request.put(`${baseUrl}/${id}`, params)
}

export function deleteDataSource(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function testLink(params) {
  return request.post(`${baseUrl}/test`, params)
}

export function testApi(params) {
  return request.post(`${baseUrl}/api/connect`, params)
}

export function getTablesOfDatasource(id) {
  return request.get(`${baseUrl}/${id}/tables`)
}
