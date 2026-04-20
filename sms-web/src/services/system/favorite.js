/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils/index'

// 判断用户租户路径
function getUrl(accountCategory) {
  return accountCategory === 'Tenant' ? 'tenants' : 'users'
}
export function getService(accountCategory) {
  return request.get(`/sms/v1/${getUrl(accountCategory)}/services`)
}
export function getFavorite(accountCategory) {
  return request.get(`/sms/v1/${getUrl(accountCategory)}/favorites`)
}
export function createFavorite(id, accountCategory) {
  return request.post(`/sms/v1/${getUrl(accountCategory)}/favorites/${id}`)
}
export function removeFavorite(id, accountCategory) {
  return request.delete(`/sms/v1/${getUrl(accountCategory)}/favorites/${id}`)
}
export function orderFavorite(params, accountCategory) {
  return request.post(`/sms/v1/${getUrl(accountCategory)}/favorites/order`, params)
}
