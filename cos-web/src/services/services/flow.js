/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getFlow(params) {
  return request.get('/fms/v1/definitions', {
    params: params
  })
}
export function getFlowDetail(id) {
  return request.get(`/fms/v1/definitions/${id}`)
}
export function createFlow(params) {
  return request.post('/fms/v1/definitions', wrapperParams(params))
}
export function modifyFlow(params) {
  return request.put(`/fms/v1/definitions/${params.id}`, wrapperParams(params))
}
export function removeFlow(id) {
  return request.delete(`/fms/v1/definitions/${id}`)
}
// 终止/激活流程定义
export function operateFlow(id, params) {
  return request.patch(`/fms/v1/definitions/${id}`, params)
}
export function getFlowInstance(params) {
  return request.get('/fms/v1/instances', {
    params: params
  })
}
export function getFlowInstanceDetail(id) {
  return request.get(`/fms/v1/instances/${id}`)
}
// 撤销审批
export function terminateInstance(id) {
  return request.patch(
    `/fms/v1/instances/${id}`,
    { action: 'terminate' },
    {
      options: {
        noParam: true
      }
    }
  )
}
// 审核节点
export function auditNode(id, params) {
  return request.patch(`/fms/v1/nodes/${id}`, params, {
    headers: { 'Content-Type': 'multipart/form-data', BsmAjaxHeader: true, options: { noSeri: true } }
  })
}
// 获取审批节点
export function getFlowNodes(id, type) {
  return request.get(`/fms/v1/instances/${id}/nodes`, {
    params: {
      type: type
    }
  })
}
// 审批流程操作历史
export function flowHistory(id) {
  return request.get(`/fms/v1/definitions/${id}/history`)
}
// 图标上传
export function getIcon(params) {
  return request({
    method: 'post',
    url: '/resource/icon/list',
    data: params
  })
}
export function getVar(type) {
  return request.get('/fms/v1/variables', {
    params: { type }
  })
}
export function createIcon(params) {
  return request.post('/ams/v1/icons', wrapperParams(params))
}
export function modifyIcon(params) {
  return request.put(`/ams/v1/icons/${params.id}`, wrapperParams(params))
}
export function removeIcon(id) {
  return request.delete(`/ams/v1/icons/${id}`)
}
export function allJugde(params) {
  return request.patch('/fms/v1/nodes', params, {
    headers: { 'Content-Type': 'multipart/form-data', BsmAjaxHeader: true, options: { noSeri: true } }
  })
}
// 获取已审批工单的任务记录
export function getTaskRecord(params) {
  return request.get('/ims/v1/task/record', {
    params
  })
}
// 任务记录重试
export function retryTaskRecord(params) {
  return request.post('/ims/v1/task/record/retry', wrapperParams(params))
}

// 失败的任务记录关联资源
export function taskRecordAssociate(params) {
  return request.post('/ims/v1/task/record/associate/resource', wrapperParams(params))
}
