import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/ims/v1/fc'
export function getVdc(params) {
  return request.get(`${baseUrl}/vdcs`, {
    params
  })
}

export function getOsVersion(params) {
  return request.get(`${baseUrl}/osversions`, {
    params
  })
}
export function getDatastore(params) {
  return request.get(`${baseUrl}/datastores`, {
    params
  })
}

// 安全组规则
const sgroupsRuleUrl = '/ims/v1/fc/sgroups/rules'
export function getGroupRule(params) {
  return request.get(sgroupsRuleUrl, {
    params
  })
}

export function createGroupRule(params) {
  return request.post(sgroupsRuleUrl, wrapperParams(params))
}
export function modifyGroupRule(params) {
  return request.put(`${sgroupsRuleUrl}/${params.id}`, wrapperParams(params))
}
export function removeGroupRule(id) {
  return request.delete(`${sgroupsRuleUrl}/${id}`)
}

export function detailGroupRule(id) {
  return request.get(`${sgroupsRuleUrl}/${id}`)
}

export function removeGroupRules(params) {
  return request.delete(sgroupsRuleUrl, { data: params })
}
export function operateCdrom(operate, params) {
  return request.patch(`/ims/v1/vms/${params.vmId}/${operate}/cdrom`, params)
}
export function getClusterMetrics(params) {
  return request.get(`${baseUrl}/monitors/${params.id}/metrics`, {
    params: params
  })
}
export function getDatastoreFiles(id) {
  return request.get(`${baseUrl}/datastores/${id}/files`)
}
// PortGroup管理
export function getPortGroup(params) {
  return request.get(`${baseUrl}/port/groups`, {
    params
  })
}
// DVSwitch
export function getSwitchers(params) {
  return request.get(`${baseUrl}/switchers`, {
    params
  })
}
// 网卡
export function getNics(params) {
  return request.get(`${baseUrl}/nics`, {
    params
  })
}
export function createNics(params) {
  return request.post(`${baseUrl}/nics`, params)
}
export function removeNics(id) {
  return request.delete(`${baseUrl}/nics/${id}`)
}
export function patchNics(params) {
  return request.patch(`${baseUrl}/nics/${params.serverId}`, params)
}
