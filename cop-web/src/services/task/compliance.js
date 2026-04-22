import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'
const baseUrl = '/cop/v1/compliance'
// 启动
export function complianceOperate(params, action) {
  return request.patch(baseUrl, {
    action, ...params
  })
}
// 常规
export function getRoutineList(params) {
  return request.get(`${baseUrl}/routines`, {
    params
  })
}
export function getRoutineDetail(id) {
  return request.get(`${baseUrl}/routines/${id}`)
}
export function createRoutine(params) {
  return request.post(`${baseUrl}/routines`, wrapperParams(params))
}
export function modifyRoutine(params) {
  return request.put(`${baseUrl}/routines/${params.id}`, wrapperParams(params))
}
export function releaseRoutine(id) {
  return request.patch(`${baseUrl}/routines/${id}/release`)
}
export function recallRoutine(id) {
  return request.patch(`${baseUrl}/routines/${id}/recall`)
}
export function removeRoutine(id) {
  return request.delete(`${baseUrl}/routines/${id}`)
}
export function routineOperate(action, id) {
  return request.patch(`${baseUrl}/routines/${id}`, {
    action
  })
}
// 基线
export function getBaseLineList(params) {
  return request.get(`${baseUrl}/items`, {
    params
  })
}
export function getAllBaseLineList() {
  return request.get(`${baseUrl}/items/all`)
}
export function getBaseLineDetail(id) {
  return request.get(`${baseUrl}/items/${id}`)
}
export function getBaseLineParams(params) {
  return request.get(`${baseUrl}/items/params`, {
    params
  })
}
export function createBaseLine(params) {
  return request.post(`${baseUrl}/items`, wrapperParams(params))
}
export function modifyBaseLine(params) {
  return request.put(`${baseUrl}/items/${params.id}`, wrapperParams(params))
}
export function removeBaseLine(id) {
  return request.delete(`${baseUrl}/items/${id}`)
}
// 历史记录
export function getHistoryList(params) {
  return request.get(`${baseUrl}/records`, {
    params
  })
}
export function getHistoryDetail(params) {
  return request.get(`${baseUrl}/records/details`, {
    params
  })
}
// 模板
export function getTemplateList(params) {
  return request.get(`${baseUrl}/templates`, {
    params
  })
}
export function getTemplateDetail(id) {
  return request.get(`${baseUrl}/templates/${id}/items`)
}
export function createTemplate(params) {
  return request.post(`${baseUrl}/templates`, wrapperParams(params))
}
export function modifyTemplate(params) {
  return request.put(`${baseUrl}/templates/${params.id}`, wrapperParams(params))
}
export function removeTemplate(id) {
  return request.delete(`${baseUrl}/templates/${id}`)
}
// 定时
export function getTimingList(params) {
  return request.get(`${baseUrl}/timings`, {
    params
  })
}
export function createTimings(params) {
  return request.post(`${baseUrl}/timings`, wrapperParams(params))
}
export function modifyTimings(params) {
  return request.put(`${baseUrl}/timings/${params.id}`, wrapperParams(params))
}
export function getTimingsDetail(id) {
  return request.get(`${baseUrl}/timings/${id}`)
}
export function timingsOperate(action, params) {
  return request.patch(`${baseUrl}/timings/${params.id}`, {
    action, ...params
  })
}
export function removeTimings(id) {
  return request.delete(`${baseUrl}/timings/${id}`)
}
export function downloadTpl(id, type) {
  downloadFile(`${baseUrl}/record/${type}/${id}`)
}
