import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const baseUrl = '/cop/v1/deploy/patchs'
export function getPatchList(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getPatchDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function getPatchDetailList(params) {
  return request.get(`${baseUrl}/details`, {
    params
  })
}
export function createPatch(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyPatch(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removePatch(id) {
  return request.delete(`${baseUrl}/${id}`)
}
export function removeBatchPatch(params) {
  return request.delete(baseUrl, {
    data: params
  })
}
export function releasePatch(id) {
  return request.patch(`${baseUrl}/${id}/release`)
}
export function recallPatch(id) {
  return request.patch(`${baseUrl}/${id}/recall`)
}
export function patchOperate(id, action, params) {
  return request.patch(`${baseUrl}/${id}`, {
    action, ...params
  })
}
//
export function getPatchTemplates(params) {
  return request.get(`${baseUrl}/templates`, {
    params
  })
}
export function getPatchsoftwares(params) {
  return request.get(`${baseUrl}/softwares`, {
    params
  })
}
export function getTaskTemplates(params) {
  return request.get('/cop/v1/deploy/tasks/templates', {
    params
  })
}
export function getTemplatesDetail(id) {
  return request.get(`/cop/v1/tasks/templates/${id}`)
}
export function getPatchHistory(params) {
  return request.get(`${baseUrl}/histories`, {
    params
  })
}
export function getPatchDetailHistory(params, id) {
  return request.get(`${baseUrl}/${id}/histories`, {
    params
  })
}
export function downloadTpl(id, type) {
  downloadFile(`${baseUrl}/histories/${id}/${type}`)
}
