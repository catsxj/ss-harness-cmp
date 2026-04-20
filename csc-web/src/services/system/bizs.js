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
export function getBizsDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createBizs(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyBizs(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeBizs(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function removeBizList(params) {
  return request.delete(`${baseUrl}`, { data: params })
}

export function getPoolByBiz(id, params) {
  return request.get(`${baseUrl}/${id}/pools`, {
    params: wrapperParams(params)
  })
}
export function configBizPool(id, params) {
  return request.post(`${baseUrl}/${id}/pools`, wrapperParams(params))
}

export function getProjectByBiz(id) {
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
export function exportBizsList() {
  downloadFile('/sms/v1/bizs/export')
}
