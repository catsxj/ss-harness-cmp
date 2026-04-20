import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const baseUrl = '/cop/v1/softwares'

export function getSoftwares(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getSoftwaresDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createSoftwares(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifySoftwares(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeSoftwares(id) {
  return request.delete(`${baseUrl}/${id}`)
}
export function applySoftwares(id) {
  return request.patch(`${baseUrl}/${id}`, {
    action: 'apply'
  })
}
export function getFileExists(name) {
  return request.get(`${baseUrl}/${name}/exists`)
}
export function getSoftwaresCheck(params) {
  return request.get(`${baseUrl}/check`, {
    params
  })
}
export function exportSoftwares(path) {
  downloadFile('/cop/v1/softwares/download', {
    path: path
  })
}
const groupUrl = '/cop/v1/softwares/groups'
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
