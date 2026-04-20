/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils/index'

const baseUrl = '/sms/v1/users'
export function getUser(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getUserDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createUser(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyUser(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeUser(id) {
  return request.delete(`${baseUrl}/${id}`)
}
/*
 * action取值为：
 * lock active reset accredit change
 */
export function checkStatus(data) {
  const { accountCategory, id } = data
  const url = accountCategory === 'User' ? baseUrl : '/sms/v1/tenants'
  return request.get(`${url}/${id}/status`)
}
