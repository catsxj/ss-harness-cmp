import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getCms(params) {
  return request.get('/cms/v1/cms', { params })
}
export function getCmsDetail(id) {
  return request.get(`/pms/v1/cms/${id}/basics`)
}
export function getCmsTopics(id) {
  return request.get(`/cms/v1/cms/kafka/${id}/topics`)
}
export function getCmsConsumer(id) {
  return request.get(`/cms/v1/cms/kafka/${id}/consumergroups`)
}
export function getCcs(params) {
  return request.get('/cms/v1/ccs', { params })
}
export function getCcsDetail(id) {
  return request.get(`/pms/v1/ccs/${id}/basics`)
}
