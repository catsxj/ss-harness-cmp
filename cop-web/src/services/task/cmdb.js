import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cop/v1/cmdb'
export function getAppLevels() {
  return request.get(`${baseUrl}/applevels`)
}
export function getModuls(params) {
  return request.get(`${baseUrl}/modules`, {
    params
  })
}
export function getTopos(params) {
  return request.get(`${baseUrl}/topos`, {
    params
  })
}
export function getHostModule() {
  return request.get(`${baseUrl}/hosts/modules`)
}
export function getHostInstance() {
  return request.get(`${baseUrl}/hosts/instances`)
}
export function getReportsDetail(id) {
  return request.get(`${baseUrl}/report/detail/${id}`)
}
export function createReports(params) {
  return request.post(`${baseUrl}/report`, wrapperParams(params))
}
export function modifyReports(params) {
  return request.put(`${baseUrl}/report/${params.id}`, wrapperParams(params))
}
export function removeReports(id) {
  return request.delete(`${baseUrl}/report/${id}`)
}
export function batchRemoveReports(params) {
  return request.delete(`${baseUrl}/report`, {
    data: wrapperParams(params)
  })
}
