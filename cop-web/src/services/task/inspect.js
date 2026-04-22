import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const baseUrl = '/cop/v1'
const inspectUrl = '/cop/v1/inspect'
// 概览
export function getFirstPage(params) {
  return request.get(`${inspectUrl}/summary`, {
    params
  })
}
export function getHistoryInfo(params) {
  return request.get(`${inspectUrl}/summary/history`, {
    params
  })
}
export function getOverviewToday(params) {
  return request.get(`${inspectUrl}/summary/current`, {
    params
  })
}
// 巡检报表
export function getReports(params) {
  return request.get(`${inspectUrl}/reports`, {
    params
  })
}
export function getReportsDetail(id) {
  return request.get(`${inspectUrl}/reports/${id}`)
}
export function createReports(params) {
  return request.post(`${inspectUrl}/reports`, wrapperParams(params))
}
export function modifyReports(params) {
  return request.put(`${inspectUrl}/reports/${params.id}`, wrapperParams(params))
}
export function removeReports(id) {
  return request.delete(`${inspectUrl}/reports/${id}`)
}
export function batchRemoveReports(params) {
  return request.delete(`${inspectUrl}/reports`, {
    data: wrapperParams(params)
  })
}

export function reportsOperate(action, id) {
  return request.patch(`${inspectUrl}/reports/${id}`, {
    action
  })
}
export function reportsBatchOperate(action, params) {
  return request.patch(`${inspectUrl}/reports`, {
    action, ...params
  })
}
export function getReportsHistorys(params) {
  return request.get(`${inspectUrl}/reports/details`, {
    params
  })
}
export function getReportsHistorysDetail(id) {
  return request.get(`${inspectUrl}/reports/details/${id}`)
}
export function getReportsHistorysTemplateDetail(params) {
  return request.get(`${inspectUrl}/reports/details/${params.id}/templates`, {
    params: params
  })
}

// 常规巡检
export function getRoutine(params) {
  return request.get(`${inspectUrl}/routines`, {
    params
  })
}
export function getAllRoutines() {
  return request.get(`${inspectUrl}/routines/all`)
}
export function getRoutineDetail(id) {
  return request.get(`${inspectUrl}/routines/${id}`)
}
export function createRoutine(params) {
  return request.post(`${inspectUrl}/routines`, wrapperParams(params))
}
export function modifyRoutine(params) {
  return request.put(`${inspectUrl}/routines/${params.id}`, wrapperParams(params))
}
export function releaseRoutine(id) {
  return request.patch(`${inspectUrl}/routines/${id}/release`)
}
export function recallRoutine(id) {
  return request.patch(`${inspectUrl}/routines/${id}/recall`)
}
export function createRun(params) {
  return request.post(`${inspectUrl}/run`, wrapperParams(params))
}
export function removeRoutine(id) {
  return request.delete(`${inspectUrl}/routines/${id}`)
}
export function removeBatchRoutine(params) {
  return request.delete(`${inspectUrl}/routines`, {
    data: wrapperParams(params)
  })
}
export function RoutineOperate(id, action) {
  return request.patch(`${inspectUrl}/routines/${id}`, {
    action
  })
}
export function RoutineBatchOperate(params, action) {
  return request.patch(`${inspectUrl}/routines`, {
    action, ...params
  })
}

// 巡检指标
export function getInspectItem(params) {
  return request.get(`${inspectUrl}/items`, {
    params
  })
}
export function getAllInspectItem() {
  return request.get(`${inspectUrl}/items/all`)
}
export function getInspectItemDetail(id) {
  return request.get(`${inspectUrl}/items/${id}`)
}
export function createInspectItem(params) {
  return request.post(`${inspectUrl}/items`, wrapperParams(params))
}
export function modifyInspectItem(params) {
  return request.put(`${inspectUrl}/items/${params.id}`, wrapperParams(params))
}
export function removeInspectItem(id) {
  return request.delete(`${inspectUrl}/items/${id}`)
}
export function removeBatchInspectItem(params) {
  return request.delete(`${inspectUrl}/items`, {
    data: wrapperParams(params)
  })
}
export function getInspectItemParams(params) {
  return request.get(`${inspectUrl}/items/params`, {
    params
  })
}

// 告警设置
export function getWarns(params) {
  return request.get(`${inspectUrl}/warns`, {
    params
  })
}
export function createWarns(params) {
  return request.post(`${inspectUrl}/warns`, wrapperParams(params))
}
export function modifyWarns(params) {
  return request.put(`${inspectUrl}/warns/${params.id}`, wrapperParams(params))
}
export function removeWarns(id) {
  return request.delete(`${inspectUrl}/warns/${id}`)
}
// 定时巡检
export function getTimings(params) {
  return request.get(`${inspectUrl}/timings`, {
    params
  })
}
export function getTimingsDetail(id) {
  return request.get(`${inspectUrl}/timings/${id}`)
}
export function createTimings(params) {
  return request.post(`${inspectUrl}/timings`, wrapperParams(params))
}
export function modifyTimings(params) {
  return request.put(`${inspectUrl}/timings/${params.id}`, wrapperParams(params))
}
export function removeTimings(id) {
  return request.delete(`${inspectUrl}/timings/${id}`)
}
export function removeBatchTimings(params) {
  return request.delete(`${inspectUrl}/timings`, {
    data: wrapperParams(params)
  })
}
export function timingsOperate(id, action) {
  return request.patch(`${inspectUrl}/timings/${id}`, {
    action
  })
}
export function timingsBatchOperate(params, action) {
  return request.patch(`${inspectUrl}/timings`, {
    action, ...params
  })
}
// 巡检模板
export function getTemplates(params) {
  return request.get(`${inspectUrl}/templates`, {
    params
  })
}
export function getTemplatesDetail(id) {
  return request.get(`${inspectUrl}/templates/${id}`)
}
export function createTemplates(params) {
  return request.post(`${inspectUrl}/templates`, wrapperParams(params))
}
export function modifyTemplates(params) {
  return request.put(`${inspectUrl}/templates/${params.id}`, wrapperParams(params))
}

export function removeTemplates(id) {
  return request.delete(`${inspectUrl}/templates/${id}`)
}
// 巡检记录
export function getRecords(params) {
  return request.get(`${inspectUrl}/records`, {
    params
  })
}
export function getRecordsDetailList(params) {
  return request.get(`${inspectUrl}/records/${params.recordId}/items`, {
    params
  })
}
export function getRecordsWarnList(params) {
  return request.get(`${inspectUrl}/records/${params.recordId}/warns`, {
    params
  })
}
export function getRecordsErrorList(params) {
  return request.get(`${inspectUrl}/records/${params.recordId}/errors`, {
    params
  })
}
export function createRecords(params) {
  return request.post(`${inspectUrl}/records`, wrapperParams(params))
}

export function getScriptList(params) {
  return request.get(`${baseUrl}/scripts`, {
    params
  })
}
export function getScriptDetail(id) {
  return request.get(`${baseUrl}/scripts/${id}`)
}
export function getScriptGroup(params) {
  return request.get(`${baseUrl}/scripts/groups`, {
    params
  })
}
// 网络环境
export function getWebEnvironment() {
  return request.get(`${baseUrl}/jdagents/environments/webs`)
}
// 服务器列表
export function getHostAgent(params) {
  return request.get(`${baseUrl}/jdagents`, {
    params
  })
}
// 执行账户
export function getIdent(params) {
  return request.get(`${baseUrl}/identifications`, {
    params
  })
}
export function getSystems(params) {
  return request.get(`${baseUrl}/cmdb/resources`, {
    params
  })
}
export function getDicts(params) {
  return request.get(`${baseUrl}/resources/dicts`, {
    params
  })
}
export function getResources(params) {
  return request.get(`${baseUrl}/resources`, {
    params
  })
}
export function getResourcesDetail(id) {
  return request.get(`${baseUrl}/resources/${id}`)
}
// 区域列表
export function getMasters(params) {
  return request.get(`${baseUrl}/saltagents/masters`, {
    params
  })
}
export function getJdAgents(params) {
  return request.get(`${baseUrl}/jdagents`, {
    params
  })
}
export function getSaltAgents(params) {
  return request.get(`${baseUrl}/saltagents`, {
    params
  })
}
export function downloadTpl(id, type) {
  downloadFile(`${inspectUrl}/records/${id}/${type}`)
}
