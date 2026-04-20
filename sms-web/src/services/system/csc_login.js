/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils/index'

export function login(params) {
  return request.post('/sms/v1/users/login', params)
}
export function loginByTenant(params) {
  return request.post('/sms/v1/tenants/login', params)
}
export function logout() {
  return request.post('/sms/v1/users/logout')
}
export function logoutByTenant(params) {
  return request.post('/sms/v1/tenants/logout', params)
}
