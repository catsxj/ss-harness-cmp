import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cop/v1/commands'

export function getCommand(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getCommandDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createCommand(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyCommand(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeCommand(id) {
  return request.delete(`${baseUrl}/${id}`)
}
export function applyCommand(id) {
  return request.patch(`${baseUrl}/${id}`)
}
export function getRoleCommand(params) {
  return request.get(`${baseUrl}/authorized`, {
    params: params
  })
}
export function accreditCommand(params) {
  return request.patch(`${baseUrl}/accredit`, wrapperParams(params))
}
