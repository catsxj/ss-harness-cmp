/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cos/v1/quotas'

export function getAlarm(params) {
  return request.get(`${baseUrl}/alarms`, {
    params
  })
}
export function getUsage(id, params) {
  return request.get(`/cos/v1/tenants/${id}/quotas`, {
    params
  })
}
export function createAlarm(params) {
  return request.post(`${baseUrl}/alarms`, wrapperParams(params))
}
export function assginQuotas(id, params) {
  return request.post(`/cos/v1/tenants/${id}/quotas`, wrapperParams(params))
}
