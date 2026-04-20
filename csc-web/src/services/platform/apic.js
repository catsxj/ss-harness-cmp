import request from 'utils/request'
import { wrapperParams } from 'utils'

// Bridge Domain列表
const domainUrl = '/nms/v1/cisco/domains'
export function getDomain(params) {
  return request.get(domainUrl, { params })
}

export function createDomain(params) {
  return request.post(domainUrl, wrapperParams(params))
}

export function modifyDomain(params) {
  return request.put(`${domainUrl}/${params.id}`, wrapperParams(params))
}

export function removeDomain(id) {
  return request.delete(`${domainUrl}/${id}`)
}

export function domainDetail(id) {
  return request.get(`${domainUrl}/${id}`)
}

// Contract列表
const contractUrl = '/nms/v1/cisco/contracts'
export function getContract(params) {
  return request.get(contractUrl, { params })
}

export function createContract(params) {
  return request.post(contractUrl, wrapperParams(params))
}

export function modifyContract(params) {
  return request.put(`${contractUrl}/${params.id}`, wrapperParams(params))
}

export function removeContract(id) {
  return request.delete(`${contractUrl}/${id}`)
}

export function contractDetail(id) {
  return request.get(`${contractUrl}/${id}`)
}

// 系统健康
const doshboardUrl = '/nms/v1/cisco'
export function getDashboardHealths(id, params) {
  return request.get(`${doshboardUrl}/${id}/dashboard/healths`, { params: wrapperParams(params) })
}

export function getDashboardNodes(id, params) {
  return request.get(`${doshboardUrl}/${id}/dashboard/nodes`, { params: wrapperParams(params) })
}

export function getDashboardTenants(id, params) {
  return request.get(`${doshboardUrl}/${id}/dashboard/tenants`, { params: wrapperParams(params) })
}

// epg列表
const epgUrl = '/nms/v1/cisco/epgs'
export function getEpg(params) {
  return request.get(epgUrl, { params })
}

export function createEpg(params) {
  return request.post(epgUrl, wrapperParams(params))
}

export function modifyEpg(params) {
  return request.put(`${epgUrl}/${params.id}`, wrapperParams(params))
}

export function removeEpg(id) {
  return request.delete(`${epgUrl}/${id}`)
}

export function epgDetail(id) {
  return request.get(`${epgUrl}/${id}`)
}

// Profile列表
const profileUrl = '/nms/v1/cisco/profiles'
export function getProfile(params) {
  return request.get(profileUrl, { params })
}

export function createProfile(params) {
  return request.post(profileUrl, wrapperParams(params))
}

export function modifyProfile(params) {
  return request.put(`${profileUrl}/${params.id}`, wrapperParams(params))
}

export function removeProfile(id) {
  return request.delete(`${profileUrl}/${id}`)
}

export function profileDetail(id) {
  return request.get(`${profileUrl}/${id}`)
}

// 主题
const subjectUrl = '/nms/v1/cisco/subjects'
export function getSubject(params) {
  return request.get(subjectUrl, { params })
}

export function createSubject(params) {
  return request.post(subjectUrl, wrapperParams(params))
}

export function modifySubject(params) {
  return request.put(`${subjectUrl}/${params.id}`, wrapperParams(params))
}

export function removeSubject(id) {
  return request.delete(`${subjectUrl}/${id}`)
}

export function subjectDetail(id) {
  return request.get(`${subjectUrl}/${id}`)
}

// 子网
const subnetUrl = '/nms/v1/cisco/subnets'
export function getSubnet(params) {
  return request.get(subnetUrl, { params })
}

export function createSubnet(params) {
  return request.post(subnetUrl, wrapperParams(params))
}

export function modifySubnet(params) {
  return request.put(`${subnetUrl}/${params.id}`, wrapperParams(params))
}

export function removeSubnet(id) {
  return request.delete(`${subnetUrl}/${id}`)
}

export function subnetDetail(id) {
  return request.get(`${subnetUrl}/${id}`)
}

export function getQuerySubnet(params) {
  return request.get(`${subnetUrl}/query`, { params: wrapperParams(params) })
}

export function getQuerySubnetPool(params) {
  return request.get(`${subnetUrl}/ips/capacity`, { params: wrapperParams(params) })
}

export function getQuerySubnetCapacity(params) {
  return request.get(`${subnetUrl}/capacity`, { params })
}

// 根据分布式端口组名称查询关联子网
export function getPortSubnet(params) {
  return request.get(subnetUrl, { params })
}

// 查询子网容量

export function getSubnetValue(params) {
  return request.get(subnetUrl, { params })
}

// 查询SDN平台IP容量

export function getSdnSubnetValue(params) {
  return request.get(subnetUrl, { params })
}

// APIC租户
const tenantUrl = '/nms/v1/cisco/tenants'
export function getTenant(params) {
  return request.get(tenantUrl, { params })
}

export function createTenant(params) {
  return request.post(tenantUrl, wrapperParams(params))
}

export function modifyTenant(params) {
  return request.put(`${tenantUrl}/${params.id}`, wrapperParams(params))
}

export function removeTenant(id) {
  return request.delete(`${tenantUrl}/${id}`)
}

export function detailTenant(id) {
  return request.get(`${tenantUrl}/${id}`)
}

// 移入资源池
export function patchTenant(id) {
  return request.patch(`${tenantUrl}/${id}`)
}

// 查询VLAN | 查看SDN VLAN
export function getVlan(params) {
  return request.get('/nms/v1/cisco/pools', { params })
}

export function getVlanCapacity(params) {
  return request.get('/nms/v1/cisco/pools/capacity', { params: wrapperParams(params) })
}

// VRF
const vrfUrl = '/nms/v1/cisco/vrfs'
export function getVrf(params) {
  return request.get(vrfUrl, { params })
}

export function createVrf(params) {
  return request.post(vrfUrl, wrapperParams(params))
}

export function modifyVrf(params) {
  return request.put(`${vrfUrl}/${params.id}`, wrapperParams(params))
}

export function removeVrf(id) {
  return request.delete(`${vrfUrl}/${id}`)
}

export function detailVrf(id) {
  return request.get(`${vrfUrl}/${id}`)
}

export function getVm(params) {
  return request.get('/nms/v1/vms', { params })
}

export function detailHost(id, type) {
  return request.get(`/nms/v1/hosts/${id}`, { type: type || 'Host' })
}
