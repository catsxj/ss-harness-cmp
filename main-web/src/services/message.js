/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'

const baseUrl = '/sms/v1/messages'
export function getMessage(params) {
  return request.get(baseUrl, {
    params,
  })
}
export function getMessageStats() {
  return request.get(`${baseUrl}/stats`)
}
export function getMessageDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function removeMessage(id) {
  return request.delete(`${baseUrl}/${id}`)
}
export function readAllMessage(params) {
  return request.patch(`${baseUrl}`, params)
}
