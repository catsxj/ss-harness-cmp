/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getVpn(params) {
  return request.get('/ims/v1/vpns', { params })
}

export function getVpnDetail(id) {
  return request.get(`/ims/v1/vpns/${id}`)
}

export function createVpn(params) {
  return request.post('/ims/v1/vpns', wrapperParams(params))
}

export function removeVpn(id) {
  return request.delete(`/ims/v1/vpns/${id}`)
}

export function getVpnPolicy(params) {
  return request.get('/ims/v1/vpnpolicies', { params })
}

export function createVpnPolicy(params) {
  return request.post('/ims/v1/vpnpolicies', wrapperParams(params))
}
export function modifyVpnPolicy(params) {
  return request.put(`/ims/v1/vpnpolicies/${params.id}`, wrapperParams(params))
}
export function removeVpnPolicy(id) {
  return request.delete(`/ims/v1/vpnpolicies/${id}`)
}

export function getVpnConnect(params) {
  return request.get('/ims/v1/vpnconns', { params })
}

export function createVpnConnect(params) {
  return request.post('/ims/v1/vpnconns', wrapperParams(params))
}
export function modifyVpnConnect(params) {
  return request.put(`/ims/v1/vpnconns/${params.id}`, wrapperParams(params))
}
export function removeVpnConnect(id) {
  return request.delete(`/ims/v1/vpnconns/${id}`)
}

export function conditionVpns(params) {
  return request.get('/ims/v1/vpns', { params })
}

export function getVpnpolicies(params) {
  return request.get('/ims/v1/vpnpolicies', { params })
}
