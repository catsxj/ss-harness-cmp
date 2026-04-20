/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils/index'

const baseUrl = '/sms/v1/tenants'
export function getTenant(params: any) {
  return request.get(baseUrl, {
    params
  })
}

// 租户配额
export function getQuotaTenant(id: number, params: any) {
  return request.get(`/cos/v1/tenants/${id}/quotas`, { params })
}

export function createQuotaTenant(id: number, params: any) {
  return request.post(`/cos/v1/tenants/${id}/quotas`, wrapperParams(params))
}

export function getOsTenant(params: any) {
  return request.get('/ims/v1/ostenants', {
    params
  })
}

export function getUser(params: any) {
  return request.get('/sms/v1/users', { params })
}
