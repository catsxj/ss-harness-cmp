import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const baseUrl = '/cms/v1/analysis/rules'
export function getRules(params) {
  return request.get(baseUrl, {
    params: params
  })
}
export function createRules(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyRules(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeRules(id) {
  return request.delete(`${baseUrl}/${id}`)
}
export function getDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function getSnapshot(params) {
  return request.get('/cms/v1/analysis/snapshots', {
    params: params
  })
}
export function removeSnapshot(id) {
  return request.delete(`/cms/v1/analysis/snapshots/${id}`)
}
export function getSnapshotDetail(params) {
  return request.get(`/cms/v1/analysis/snapshots/${params.id}`, {
    params: wrapperParams(params)
  })
}
export function handleAnalysis(params) {
  return request.post('/cms/v1/analysis/snapshots', wrapperParams(params))
}
export function exportAnalysis(id, params) {
  downloadFile(`/cms/v1/analysis/snapshots/${id}/download`, { params })
}
