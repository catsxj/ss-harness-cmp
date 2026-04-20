import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cop/v1/servers/users'

export function manageService(params) {
  return request.patch('/cop/v1/servers/services', wrapperParams(params))
}
export function createUser(params) {
  return request.post(`${baseUrl}`, wrapperParams(params))
}
export function modifyUser(params) {
  return request.put(`${baseUrl}`, wrapperParams(params))
}
export function removeUser(params) {
  return request.delete(`${baseUrl}`, { data: params })
}

const authUrl = `${baseUrl}/auths`
export function createAuth(params) {
  return request.post(`${authUrl}`, wrapperParams(params))
}
export function getAuth(params) {
  return request.get(`${authUrl}`, {
    params: wrapperParams(params)
  })
}
export function removeAuth(params) {
  return request.delete(`${authUrl}`, { data: params })
}
