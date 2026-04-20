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

export function removeProject(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function exportProject(params) {
  downloadFile(`${baseUrl}/export`, { params })
}

export function settingProjectUser(id, params) {
  return request.post(`${baseUrl}/${id}/users`, wrapperParams(params))
}

export function conditionProject(params) {
  return request.get(`${baseUrl}/condition`, {
    params
  })
}
