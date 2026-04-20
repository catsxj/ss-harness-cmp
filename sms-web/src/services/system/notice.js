/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils/index'

const baseUrl = '/sms/v1/system/notice'

export function getNotice(params) {
  return request.get(baseUrl, {
    params
  })
}
export function createNotice(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyNotice(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeNotice(id) {
  return request.delete(`${baseUrl}/${id}`)
}
export function sendNotice(id) {
  return request.post(`${baseUrl}/send/${id}`)
}
