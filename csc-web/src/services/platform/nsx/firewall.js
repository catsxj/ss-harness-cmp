import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/nms/v1/nsx/firewall-sections'
export function getFirewall(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createFirewall(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyFirewall(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeFirewall(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function batchRemoveFirewall(params) {
  return request.delete(`${baseUrl}`, {
    data: wrapperParams(params)
  })
}

export function getFirewallDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
const ruleUrl = '/nms/v1/nsx/firewall-rules'
export function getFirewallRule(params) {
  return request.get(ruleUrl, {
    params
  })
}

export function createFirewallRule(params) {
  return request.post(ruleUrl, wrapperParams(params))
}

export function configFirewallRule(params) {
  return request.put(`${ruleUrl}`, wrapperParams(params))
}

export function removeFirewallRule(id) {
  return request.delete(`${ruleUrl}/${id}`)
}

export function getFirewallRuleDetail(id) {
  return request.get(`${ruleUrl}/${id}`)
}
