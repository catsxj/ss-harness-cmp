/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const baseUrl = '/cop/v1/scripts'

export function getScript(params) {
  return request.get(baseUrl, {
    params
  })
}
export function releaseRoutine(id) {
  return request.patch(`${baseUrl}/${id}/release`)
}
export function recallRoutine(id) {
  return request.patch(`${baseUrl}/${id}/recall`)
}
// simple修改
export function getScriptBySimple(params) {
  return request.get(`${baseUrl}/simple`, {
    params
  })
}
export function getScriptDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createScript(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyScript(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeScript(id) {
  return request.delete(`${baseUrl}/${id}`)
}
export function exportScript(id) {
  downloadFile(`${baseUrl}/${id}/export`)
}
export function operateScript(id, action) {
  return request.patch(`${baseUrl}/${id}`, {
    action
  })
}

const groupUrl = '/cop/v1/scripts/groups'
export function getGroup(params) {
  return request.get(groupUrl, {
    params
  })
}
export function getGroupDetail(id) {
  return request.get(`${groupUrl}/${id}`)
}
export function createGroup(params) {
  return request.post(groupUrl, wrapperParams(params))
}
export function modifyGroup(params) {
  return request.put(`${groupUrl}/${params.id}`, wrapperParams(params))
}
export function removeGroup(id) {
  return request.delete(`${groupUrl}/${id}`)
}

const versionUrl = '/cop/v1/scripts/versions'
export function getVersion(id, params) {
  return request.get(`${baseUrl}/${id}/versions`, {
    params
  })
}
export function getVersionDetail(id) {
  return request.get(`${versionUrl}/${id}`)
}
export function createVersion(params) {
  return request.post(versionUrl, wrapperParams(params))
}
export function modifyVersion(params) {
  return request.put(`${versionUrl}/${params.id}`, wrapperParams(params))
}
export function removeVersion(id) {
  return request.delete(`${versionUrl}/${id}`)
}
export function compareVersion(id) {
  return request.patch(`${versionUrl}/${id}`, {
    action: 'compare'
  })
}
export function getVersionHistory(id, params) {
  return request.get(`${versionUrl}/${id}/contents`, { params })
}
// simple修改
export function getVersionHistoryBySimple(id, params) {
  return request.get(`${versionUrl}/${id}/contents/simple`, { params })
}
