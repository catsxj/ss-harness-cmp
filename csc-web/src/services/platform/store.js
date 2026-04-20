/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getHarbor(params) {
  return request.get('/ims/v1/harbor', { params })
}

export function detailHarbor(id) {
  return request.get(`/ims/v1/harbor/${id}`)
}

export function createHarbor(params) {
  return request.post('/ims/v1/harbor/create', wrapperParams(params))
}

export function syncHarbor(id) {
  return request.put(`/ims/v1/harbor/${id}/sync`)
}

export function deleteHarbor(id) {
  return request.delete(`/ims/v1/harbor/${id}`)
}

export function getHarborImage(id, params) {
  return request.get(`/ims/v1/harbor/${id}/images`, { params })
}

export function modifyHarborImage(params) {
  return request.put(`/ims/v1/harbor/${params.id}/images`, wrapperParams(params))
}

export function getHarborImageDetail(id) {
  return request.get(`/ims/v1/harbor/${id}/images/detail`)
}

export function getHarborImageTag(id) {
  return request.get(`/ims/v1/harbor/${id}/tags`)
}

export function deleteHarborImageTag(id) {
  return request.delete(`/ims/v1/harbor/${id}/tags`)
}

export function createImage(params) {
  return request.post(`/ims/v1/harbor/${params.harborId}/images/upload`, wrapperParams(params))
}

export function checkImage(params) {
  return request.get('/ims/v1/harbor/images/download/check', { params: wrapperParams(params) })
}

export function pushImage(params) {
  return request.post(`/ims/v1/harbor/${params.harborId}/push`, wrapperParams(params))
}
