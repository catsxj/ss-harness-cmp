/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function login(params) {
  return request.post('/sms/v1/users/login', params)
}
export function getTokenInfo(params) {
  return request.post('/sms/v1/sso/token/info', params)
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
export function getSysconf() {
  return request.get('/sms/v1/configs')
}
export function getSysconfCode(params) {
  return request.get('/sms/v1/configs', { params })
}
export function modifySysconf(data) {
  return request.put('/sms/v1/configs', wrapperParams(data))
}

export function syncLdapApi() {
  return request.post('/sms/v1/configs/syncLdap')
}
// 获取首页概览信息
export function getPortal(params) {
  return request.get('/ims/v1/portal/platform/stats', { params: wrapperParams(params) })
}
export function getServiceQuota(tenantId, data) {
  return request.get(`/cos/v1/tenants/${tenantId}/quotas`, {
    params: wrapperParams(data)
  })
}
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
// 获取树状系统配置信息
export function getSystemTreeConfigs(params) {
  return request.get('/sms/v1/configs/tree', { params })
}
// 更新系统配置信息
export function updateSystemConfigs(params) {
  return request.put('/sms/v1/system-configs', params, {
    headers: { 'Content-Type': 'multipart/form-data', BsmAjaxHeader: true, options: { noSeri: true } }
  })
}
// 测试连接
export function testLinkApi(category) {
  return request.get('/sms/v1/configs/test', { params: { category } })
}
