import request from 'utils/request'
import { wrapperParams } from 'utils'

export function conditionCloudVendor(params) {
  return request.get(`${cloudVendorUrl}/condition`, { params })
}
const cloudVendorUrl = '/ims/v1/vendors'
export function getCloudVendor(params, url) {
  return request.get(`${url || cloudVendorUrl}`, {
    params
  })
}
export function detailCloudVendor(id, url) {
  return request.get(`${url || cloudVendorUrl}/${id}`)
}
// 主机
const hostUrl = '/ims/v1/hosts'
export function getHost(params) {
  return request.get(hostUrl, {
    params
  })
}
// 云主机
const vmUrl = '/ims/v1/vms'
export function getVm(params) {
  return request.get(vmUrl, { params })
}
export function detailVm(id) {
  return request.get(`${vmUrl}/${id}`)
}
// 安全组规则
const sgroupsRuleUrl = '/ims/v1/sgroups/rules'
export function getGroupRule(params) {
  return request.get(sgroupsRuleUrl, {
    params
  })
}
// 集群
const clutersUrl = '/ims/v1/clusters'
export function getCluters(params) {
  return request.get(clutersUrl, {
    params
  })
}
// 字典
const dictUrl = '/sms/v1/dictionaries'
export function getDict(params) {
  return request.get(dictUrl, { params })
}

// volume
const volumeUrl = '/ims/v1/volumes'
export function getVolume(params, url) {
  return request.get(url || volumeUrl, {
    params
  })
}

export function getResourceList() {
  return request.get('/cms/v1/monitor/resourcetype', { params: { rows: 99, page: 1 } })
}
