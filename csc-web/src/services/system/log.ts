/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from '@/common/utils'

const baseUrl = '/sms/v1/logs'

export function getLog(params: Base.IListParams) {
  return request.get<any, Base.IResponseData>(baseUrl, {
    params
  })
}
export function getLogStats() {
  return request.get(`${baseUrl}/stats`)
}
export function getLogView() {
  return request.get('/cos/v1/logview')
}
export function exportLog() {
  downloadFile('/cos/v1/logfile')
}
export function accessLog(params: any) {
  downloadFile('/sms/v1/logs/archive', params)
}
export function getRecords(params: any) {
  return request.get('/sms/v1/archives', {
    params
  })
}
