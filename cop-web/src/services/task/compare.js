import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cop/v1/compare'
export function operateBackups(action, params) {
  return request.patch(`${baseUrl}/backups`, {
    action, ...params
  })
}

// 标准对比
export function getStandardCompareList(params) {
  return request.get(`${baseUrl}/standards`, {
    params
  })
}
export function createStandardCompare(params) {
  return request.post(`${baseUrl}/standards`, wrapperParams(params))
}
// 标准文件列表
export function getStandardFileList(params) {
  return request.get(`${baseUrl}/standard/files`, {
    headers: { options: { ignoreError: true } },
    params
  })
}
export function getStandardFiles(params) {
  return request.get(`${baseUrl}/standard/files/subsystem`, {
    headers: { options: { ignoreError: true } },
    params
  })
}
export function uploadStandardFileList(params) {
  return request.post(`${baseUrl}/standard/files`, wrapperParams(params), {
    headers: { 'Content-Type': 'multipart/form-data', BsmAjaxHeader: true, options: { noSeri: true } }
  })
}
export function removeStandardFile(params) {
  return request.delete(`${baseUrl}/standard/files/${params.id}`, {
    data: params
  })
}
// 文件列表
export function getFileList(params) {
  return request.get(`${baseUrl}/standard/files/contents`, {
    headers: { options: { ignoreError: true } },
    params
  })
}
export function createCompare(params) {
  return request.post(`${baseUrl}/standards`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', BsmAjaxHeader: true }
  })
}

// 历史对比
export function getHistoryCompareList(params) {
  return request.get(`${baseUrl}/historicals`, {
    params
  })
}
export function createHistoryCompare(params) {
  return request.post(`${baseUrl}/historicals`, wrapperParams(params), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', BsmAjaxHeader: true }
  })
}
// 跨机对比
export function getCrossCompareList(params) {
  return request.get(`${baseUrl}/crosses`, {
    params
  })
}
export function createCrossCompare(params) {
  return request.post(`${baseUrl}/crosses`, wrapperParams(params), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', BsmAjaxHeader: true }
  })
}
export function removeCrossCompare(id) {
  return request.delete(`${baseUrl}/crosses/${id}`)
}
export function getCheckDeviceGroupList(params) {
  return request.get(`${baseUrl}/devices/groups`, {
    params
  })
}
export function getAllDeviceList(params) {
  return request.get(`${baseUrl}/devices`, {
    headers: { options: { ignoreError: true } },
    params
  })
}
export function getDeviceGroupRelation(params) {
  return request.get(`${baseUrl}/devices/groups/relations`, {
    headers: { options: { ignoreError: true } },
    params
  })
}
// 对比结果
export function getCompareTaskResult(params) {
  return request.get(`${baseUrl}/results`, {
    params
  })
}
// 命令白名单
export function getWhiteList(params) {
  return request.get(`${baseUrl}/whites`, {
    params
  })
}
export function createWhite(params) {
  return request.post(`${baseUrl}/whites`, wrapperParams(params))
}
export function modifyWhite(params) {
  return request.put(`${baseUrl}/whites/${params.id}`, wrapperParams(params))
}
export function removeWhite(id) {
  return request.delete(`${baseUrl}/whites/${id}`)
}
export function getWhiteListById(id) {
  return request.get(`${baseUrl}/whites/${id}`)
}
