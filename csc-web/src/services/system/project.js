/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const baseUrl = '/sms/v1/projects'
export function getProject(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getProjectUser(params) {
  return request.get(`${baseUrl}/${params.id}/users`, {
    params
  })
}
export function getProjectDetailInfo(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function getProjectDetail(id) {
  return request.get(`${baseUrl}/${id}/quotas`)
}
export function createProject(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyProject(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function switchProject(id, params) {
  return request.patch(`${baseUrl}/${id}`, wrapperParams(params))
}
export function removeProject(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function removeProjectList(params) {
  return request.delete(`${baseUrl}`, { data: params })
}

export function exportProject(params) {
  downloadFile(`${baseUrl}/export`, { params })
}
export function getProjectByTenant(id, params) {
  return request.get(`/sms/v1/tenants/${id}/projects`, {
    ...wrapperParams(params)
  })
}

export function getProjectMemberList(id) {
  return request.get(`${baseUrl}/${id}/users`)
}

export function settingProjectUser(id, params) {
  return request.post(`${baseUrl}/${id}/users`, wrapperParams(params))
}

export function exportProjects(params) {
  downloadFile('/sms/v1/projects/export', params)
}

export function conditionProject(params) {
  return request.get(`${baseUrl}/condition`, {
    params
  })
}
