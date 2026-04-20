/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getIcon(params) {
  return request.get('/ams/v1/icons', {
    params: params
  })
}
export function createIcon(params) {
  return request.post('/ams/v1/icons', wrapperParams(params))
}
export function modifyIcon(params) {
  return request.put(`/ams/v1/icons/${params.id}`, wrapperParams(params))
}
export function removeIcon(id) {
  return request.delete(`/ams/v1/icons/${id}`)
}
