/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getDashboard(params) {
  return request.get('/cos/v1/soa/resources/statistics', {
    params: wrapperParams(params)
  })
}
export function getStatusAz(params) {
  return request.get('/cos/v1/soa/resources/status', {
    params: wrapperParams(params)
  })
}
export function getCapacityAz(params) {
  return request.get('/cos/v1/soa/resources/capacityNew', {
    params: wrapperParams(params)
  })
}
export function getCapacityCount(params) {
  return request.get('/cos/v1/soa/resources/cloudCapacity', {
    params: wrapperParams(params)
  })
}
export function getAllCloudCount(params) {
  return request.get('/cos/v1/soa/resources/getAllCloudCount', {
    params: wrapperParams(params)
  })
}
