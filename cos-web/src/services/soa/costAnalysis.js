import request from 'utils/request'
import { formaterFormData, downloadFile } from 'utils'
const baseUrl = '/cms/v1/costAnalysis'
// 白名单
export function getWhiteList(params) {
  return request.get(`${baseUrl}/whiteList`, { params })
}
export function removeWhiteList(params) {
  return request.patch(`${baseUrl}/whiteList`, formaterFormData(params))
}
export function addWhiteList(params) {
  return request.post(`${baseUrl}/whiteList`, formaterFormData(params))
}

// 规则
export function getRules(params) {
  return request.get(`${baseUrl}/rule`, { params })
}
export function getRuleDetail(id) {
  return request.get(`${baseUrl}/rule/${id}`)
}
export function modifyRules(params) {
  return request.patch(`${baseUrl}/rule`, params)
}
export function createRules(params) {
  return request.post(`${baseUrl}/rule`, params)
}
export function deleteRule(id) {
  return request.delete(`${baseUrl}/rule/${id}`)
}

// 优化清单
export function getChecklist(params) {
  return request.get(`${baseUrl}/optimizeList`, { params })
}
export function downloadChecklist(params) {
  downloadFile(`${baseUrl}/downloadOptimizeList`, params)
}
export function disposeChecklist(params) {
  return request.post(`${baseUrl}/handleOptimize`, params)
}
// 新增资源
export function getNewResourceList(params) {
  return request.get(`${baseUrl}/newResourceList`, { params })
}
export function downloadNewResourceList(params) {
  downloadFile(`${baseUrl}/newResourceList/download`, params)
}
// 全局资源监测
export function getGlobalResourceMonitoringCount(params) {
  return request.get(`${baseUrl}/titleData`, {
    params
  })
}
export function refreshGlobalResourceMonitoring(params) {
  return request.get(`${baseUrl}/rule`, {
    params
  })
}
export function downloadGlobalResourceList(params) {
  downloadFile(`${baseUrl}/resource/download`, params)
}

// 成本优化
export function getCostOptimization(params) {
  return request.get(`${baseUrl}/costOptimizeList`, {
    params
  })
}
export function downloadCostOptimization(params) {
  downloadFile(`${baseUrl}/costOptimizeList/download`, params)
}
export function getCostOptimizationCount(params) {
  return request.get(`${baseUrl}/costOptimizeList/title`, {
    params
  })
}
export function getCostOptimizationMonth(params) {
  return request.get(`${baseUrl}/costOptimizeList/month`, {
    params
  })
}
