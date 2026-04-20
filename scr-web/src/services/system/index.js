/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function login (params) {
  return request.post('/sms/v1/users/login', params)
}
export function logout () {
  return request.post('/sms/v1/users/logout')
}
export function getSystemConfigs(params) {
  return request.get('/sms/v1/configs', { params })
}
// 获取token
export function refreshToken (params) {
  return request.get('/sms/v1/token', { params })
}
export function getDictChildren(params) {
  return request.get('/sms/v1/dictionaries/children', { params })
}
// 获取应用信息
export function getAppInfo (code) {
  return request.get('/sms/v1/apps', {
    params: {
      condition: JSON.stringify({
        condition: 'queryByCode',
        code
      })
    }
  })
}
