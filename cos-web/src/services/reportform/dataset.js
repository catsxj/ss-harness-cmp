import request from 'utils/request'
import { downloadFile } from 'utils'

const baseUrl = '/rms/v1/dataset'
const groupUrl = `${baseUrl}/group`
export function getGroup(params) {
  return request.get(groupUrl, { params })
}

export function createGroup(params) {
  return request.post(groupUrl, params)
}

export function updateGroup(params, id) {
  return request.put(`${groupUrl}/${id}`, params)
}

export function deleteGroup(id) {
  return request.delete(`${groupUrl}/${id}`)
}

export function getDataset(params) {
  return request.get(baseUrl, { params })
}

export function createDataset(params) {
  return request.post(baseUrl, params)
}
export function updateDataset(params, id) {
  return request.put(`${baseUrl}/${id}`, params)
}

export function deleteDataset(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function previewSql(params) {
  return request.post(`${baseUrl}/sql`, params)
}

export function previewData(params) {
  return request.post(`${baseUrl}/preview`, params)
}

export function getPreviewById(id, params) {
  return request.get(`${baseUrl}/data/${id}`, { params })
}

export function getJsSnippets(id) {
  return request.get(`${baseUrl}/field/js/${id}`)
}

export function getRelatedById(id) {
  return request.get(`${baseUrl}/json/${id}`)
}

export function createRelated(params) {
  return request.post(`${baseUrl}/json`, params)
}

export function updateRelated(params, id) {
  return request.put(`${baseUrl}/json/${id}`, params)
}

export function deleteRelated(id) {
  return request.delete(`${baseUrl}/json/${id}`)
}

export function getFeildById(id) {
  return request.get(`${baseUrl}/field/${id}`)
}

export function createFeild(params) {
  return request.post(`${baseUrl}/field`, params)
}

export function deleteFeild(id) {
  return request.delete(`${baseUrl}/field/${id}`)
}

export function updateFeildById(params, id) {
  return request.put(`${baseUrl}/field/${id}`, params)
}

export function syncFeildData(id) {
  return request.get(`${baseUrl}/field/sync/${id}`)
}

export function getInfosById(id) {
  return request.get(`${baseUrl}/${id}`)
}

export function getDatabaseFuncitons() {
  return request.get(`${baseUrl}/field/function`)
}

export function getReflect(id) {
  return request.get(`${baseUrl}/field/dictionaries/${id}`)
}

export function updateFeildReflect(params, id) {
  return request.post(`${baseUrl}/field/dictionaries/${id}`, params)
}

export function getSelectFilter(id, key) {
  return request.get(`${baseUrl}/filter/${id}`, { params: { key } })
}

export function getFieldsOfTables(id, params) {
  return request.get(`${baseUrl}/field/table/${id}`, { params })
}

export function exportData(id, params) {
  console.log(id, params)
  downloadFile(`${baseUrl}/export/${id}`, params)
}
