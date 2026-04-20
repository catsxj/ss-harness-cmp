/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function login(params) {
  return request.post('/sms/v1/users/login', params)
}
export function getToken() {
  return request.post('/sms/v1/sso/check')
}
export function getUserInfo() {
  return request.get('/sms/v1/login/detail')
}
export function logout() {
  return request.post('/sms/v1/users/logout')
}
export function getConfig(params) {
  return request.get('/sms/v1/logo', {
    params: wrapperParams(params)
  })
}
export function getDict(data) {
  return request.get('/dict/children', {
    params: wrapperParams(data)
  })
}

// 获取首页概览信息

export function replaceToken(params) {
  return request.get('/sms/v1/token', { params })
}
// 获取用户权限
export function getUserPermissions() {
  return request.get('/sms/v1/users/permissions')
}
// 获取系统配置信息
export function getSystemConfigs(params) {
  return request.get('/sms/v1/configs', { params })
}

export function getSysconfCode(params) {
  return request.get('/sms/v1/configs', { params })
}
