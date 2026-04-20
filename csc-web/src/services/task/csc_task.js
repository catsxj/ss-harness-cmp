/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cop/v1/tasks'
export function getCos(params) {
  return request.get('/cos/v1/cos', { params })
}
export function removeTask(id) {
  return request.delete(`/cos/v1/cos/${id}`)
}
export function getHistory(params) {
  return request.get('/cop/v1/tasks/instances', { params })
}
export function executeCosTask(params) {
  return request.put('/cos/v1/cos', wrapperParams(params))
}
export function getRos(params) {
  return request.get('/cos/v1/ros', { params })
}
export function removeRos(id) {
  return request.delete(`/cos/v1/ros/${id}`)
}
export function executeRosTask(params) {
  return request.put('/cos/v1/ros', wrapperParams(params))
}
