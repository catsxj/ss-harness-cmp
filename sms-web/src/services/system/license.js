/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'
const baseUrl = '/sms/v1/config'

export function getStatus(params) {
  return request.get(`${baseUrl}/status`, {
    params
  })
}
export function getSid() {
  return request.get('/sms/v1/status/sids')
}
export function getServer(params) {
  return request.get(`${baseUrl}/servers`, {
    params
  })
}
export function getLicense() {
  return request.get(`${baseUrl}/license`)
}
export function installCaptcha(params) {
  return request.post('/sms/v1/config/captcha/install', params)
}
