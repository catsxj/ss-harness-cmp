import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cop/v1/tasknodes/modules'

export function getModule(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getModuleDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createModule(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyModule(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeModule(id) {
  return request.delete(`${baseUrl}/${id}`)
}

const groupUrl = `${baseUrl}/groups`
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
export function getTreeNodes(params) {
  return request.get(`${groupUrl}/nodes`, { params })
}

const templateUrl = '/cop/v1/tasknodes/templates'
export function getTemplate(params) {
  return request.get(templateUrl, {
    params
  })
}
// simple修改
export function getTemplateBySimple(params) {
  return request.get(`${templateUrl}/simple`, {
    params
  })
}
export function getTemplateDetail(id) {
  return request.get(`${templateUrl}/${id}`)
}
export function createTemplate(params) {
  return request.post(templateUrl, wrapperParams(params))
}
export function modifyTemplate(params) {
  return request.put(`${templateUrl}/${params.id}`, wrapperParams(params))
}
export function removeTemplate(id) {
  return request.delete(`${templateUrl}/${id}`)
}
