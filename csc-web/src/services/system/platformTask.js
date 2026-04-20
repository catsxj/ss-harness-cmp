import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/sms/v1/system/tasks'

export function getTasks(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getTasksDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createTasks(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyTasks(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeTasks(id) {
  return request.delete(`${baseUrl}/${id}`)
}
