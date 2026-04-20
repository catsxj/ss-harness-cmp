import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const baseUrl = '/cms/v1/analysis'
export function getRules(params) {
  return request.get(`${baseUrl}/rules`, {
    params: params
  })
}
export function createRules(params) {
  return request.post(`${baseUrl}/rules`, wrapperParams(params))
}
export function modifyRules(params) {
  return request.put(`${baseUrl}/rules/${params.id}`, wrapperParams(params))
}
export function removeRules(id) {
  return request.delete(`${baseUrl}/rules/${id}`)
}
export function getDetail(id) {
  return request.get(`${baseUrl}/rules/${id}`)
}
export function getSnapshot(params) {
  return request.get(`${baseUrl}/snapshots`, {
    params: params
  })
}
export function removeSnapshot(id) {
  return request.delete(`${baseUrl}/snapshots/${id}`)
}
export function getSnapshotDetail(params) {
  return request.get(`${baseUrl}/snapshots/${params.id}`, {
    params: wrapperParams(params)
  })
}
export function handleAnalysis(params) {
  return request.post(`${baseUrl}/snapshots`, wrapperParams(params))
}
export function exportAnalysis(id, params) {
  downloadFile(`${baseUrl}/snapshots/${id}/download`, { params })
}
