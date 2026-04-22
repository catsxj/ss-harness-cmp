/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils/index'

const baseUrl = '/sms/v1/bizs'
export function getBizs(params) {
  return request.get(baseUrl, {
    params
  })
}

export function getPoolByBiz(id, params) {
  return request.get(`${baseUrl}/${id}/pools`, {
    params: wrapperParams(params)
  })
}
export function configBizPool(id, params) {
  return request.post(`${baseUrl}/${id}/pools`, wrapperParams(params))
}

// 获取单个业务的关联项目
export function getProjectByBizList(id) {
  return request.get(`${baseUrl}/${id}/projects`)
}

export function pacthRelatioonBiz(id, params) {
  return request.patch(`${baseUrl}/${id}`, wrapperParams(params))
}

export function operateBiz(id, action, params) {
  return request.patch(`${baseUrl}/${id}`, {
    action,
    ...wrapperParams(params)
  })
}

// 导出业务列表
export function exportBizsList(params) {
  downloadFile('/sms/v1/bizs/export', params)
}
