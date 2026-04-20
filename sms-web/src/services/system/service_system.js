/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cms/v1/system'
export function getServers(params) {
  return request.get(`${baseUrl}/servers`)
}
export function getServersDetail(params) {
  return request.get(`${baseUrl}/charts`, {
    params: wrapperParams(params)
  })
}
export function getServices(params) {
  return request.get(`${baseUrl}/services`)
}
export function getPlugs(params) {
  return request.get(`${baseUrl}/plugins`)
}
export function getComponents(params) {
  return request.get(`${baseUrl}/components`)
}
export function getGateway() {
  return request.get(`${baseUrl}/gateway`)
}
export function getStatus(params) {
  return request.get(`${baseUrl}/status`, {
    params
  })
}
