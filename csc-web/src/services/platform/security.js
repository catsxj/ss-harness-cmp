import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

export function getResource(params) {
  return request.get('/nms/v1/resources', {
    params: params
  })
}
export function createResource(params) {
  return request.post('/nms/v1/resources', wrapperParams(params))
}
export function modifyResource(params) {
  return request.put(`/nms/v1/resources/${params.id}`, {
    type: 'common',
    ...wrapperParams(params)
  })
}
export function removeResource(id) {
  return request.delete(`/nms/v1/resources/${id}`)
}
export function getResourceDetail(id) {
  return request.get(`/nms/v1/resources/${id}`)
}
export function getResourceType(params) {
  return request.get('/nms/v1/resources/types', {
    params: params
  })
}
export function downloadClient(params) {
  return request.get('/nms/v1/resources/access/client', {
    params: wrapperParams(params)
  })
}
export function getProtocol(params) {
  return request.get('/nms/v1/resources/protocol', {
    params: params
  })
}
export function operateResource(action, params) {
  return request.patch('/nms/v1/resources', {
    action: action,
    ...wrapperParams(params)
  })
}
export function beforeAccessResource(id) {
  return request.get(`/nms/v1/resources/access_config/${id}`)
}
export function accessResource(action, params) {
  return request.patch(`/nms/v1/resources/${params.id}`, {
    action: action,
    ...wrapperParams(params)
  })
}
export function getResourceAudit(params) {
  return request.get('/nms/v1/resource/audit', {
    params: params
  })
}
export function exportAudit(params) {
  downloadFile('/nms/v1/resource/audit/export', { params })
}
export function downloadAudit(type, id, params) {
  downloadFile(`/nms/v1/resource/audit/${type}/${id}`, { ...params })
}
export function killSess(id, action, params) {
  return request.patch(`/nms/v1/resource/audit/${id}`, {
    action: action,
    ...wrapperParams(params)
  })
}
export function getPolicyByVendor(id) {
  return request.get(`/nms/v1/tenable/scan/policy/vendors/${id}`)
}
export function getRepositoryByVendor(id) {
  return request.get(`/nms/v1/tenable/scan/repository/vendors/${id}`)
}
export function getAssetByVendor(id) {
  return request.get(`/nms/v1/tenable/asset/vendors/${id}`)
}
export function getScheduleType(type, params) {
  return request.get(`/nms/v1/tenable/scan/scheduletype/${type}`, {
    params: params
  })
}
export function getTenableScanDetail(id) {
  return request.get(`/nms/v1/tenable/scan/${id}`)
}
export function createTenableScan(params) {
  return request.post('/nms/v1/tenable/scan', wrapperParams(params))
}
export function getTenableScan(params) {
  return request.get('/nms/v1/tenable/scan', {
    params: params
  })
}
export function modifyTenableScan(params) {
  return request.put(`/nms/v1/tenable/scan/${params.id}`, wrapperParams(params))
}
export function removeTenableScan(id) {
  return request.delete(`/nms/v1/tenable/scan/${id}`)
}
export function operateTenableScan(id) {
  return request.post(`/nms/v1/tenable/scan/launch/${id}`)
}
export function getTenableScanPolicy(params) {
  return request.get('/nms/v1/tenable/scan/policy', {
    params: params
  })
}
export function createTenableScanPolicy(params) {
  return request.post('/nms/v1/tenable/scan/policy', wrapperParams(params))
}
export function modifyTenableScanPolicy(params) {
  return request.put(`/nms/v1/tenable/scan/policy/${params.id}`, wrapperParams(params))
}
export function removeTenableScanPolicy(id) {
  return request.delete(`/nms/v1/tenable/scan/policy/${id}`)
}

export function getTenableScanResult(params) {
  return request.get('/nms/v1/tenable/scan/result', {
    params: params
  })
}
export function createTenableScanResult(params) {
  return request.post('/nms/v1/tenable/scan/result', wrapperParams(params))
}
export function modifyTenableScanResult(params) {
  return request.put(`/nms/v1/tenable/scan/result/${params.id}`, wrapperParams(params))
}
export function removeTenableScanResult(id) {
  return request.delete(`/nms/v1/tenable/scan/result/${id}`)
}
export function getTenableIp(params) {
  return request.get('/nms/v1/tenable/analysis/ipsummary', { params: params })
}
export function getTenableIpDetail(params) {
  return request.get('/nms/v1/tenable/analysis/vulnerability', { params: params })
}
export function getTemplate(vendorId, type) {
  return request.get(`/nms/v1/tenable/${vendorId}/scan/oscategory/${type}`)
}
// 资产类别
export function getCategory(params) {
  return request.get('/nms/v1/resources/category', {
    params: params
  })
}
// 资产类型
export function getCatalog(params) {
  return request.get('/nms/v1/resources/catalog', {
    params: params
  })
}
// 客户端下载
export function getClient(params) {
  return request.get('/nms/v1/resources/access/client', {
    params: params
  })
}
// 堡垒机部门
export function getDepartment(params) {
  return request.get('/nms/v1/shterm/department', { params: params })
}
export function getDepartmentAll(params) {
  return request.get('/nms/v1/shterm/department/tree', { params: params })
}
export function getDepartDetail(id) {
  return request.get(`/nms/v1/shterm/department/${id}`)
}
export function createDepart(params) {
  return request.post('/nms/v1/shterm/department', wrapperParams(params))
}
export function modifyDepart(params) {
  return request.put(`/nms/v1/shterm/department/${params.id}`, wrapperParams(params))
}
export function removeDepart(id) {
  return request.delete(`/nms/v1/shterm/department/${id}`)
}
// 用户
export function getUser(params) {
  return request.get('/nms/v1/shterm/user', { params: params })
}
export function getUserDevices(id, params) {
  return request.get(`/nms/v1/shterm/user/${id}/devices`, { params: params })
}
export function getUserDetail(id) {
  return request.get(`/nms/v1/shterm/user/${id}`)
}
export function createUser(params) {
  return request.post('/nms/v1/shterm/user', wrapperParams(params))
}
export function modifyUser(params) {
  return request.put('/nms/v1/shterm/user', wrapperParams(params))
}
export function removeUser(id) {
  return request.delete(`/nms/v1/shterm/user/${id}`)
}
export function getUserRoles(params) {
  return request.get('/nms/v1/shterm/role', { params: params })
}
// 用户组
export function getUserGroup(params) {
  return request.get('/nms/v1/shterm/user/group', { params: params })
}
export function getUserGroupDetail(id) {
  return request.get(`/nms/v1/shterm/user/group/${id}`)
}
export function createUserGroup(params) {
  return request.post('/nms/v1/shterm/user/group', wrapperParams(params))
}
export function modifyUserGroup(params) {
  return request.put(`/nms/v1/shterm/user/group/${params.id}`, wrapperParams(params))
}
export function removeUserGroup(id) {
  return request.delete(`/nms/v1/shterm/user/group/${id}`)
}
export function getAddUserGroup(id, params) {
  return request.get(`/nms/v1/shterm/user/group/listUsers/${id}`, {
    params: params
  })
}
export function relateUserGroup(params) {
  return request.put(`/nms/v1/shterm/user/group/relateUsers/${params.id}`, wrapperParams(params))
}
export function deleteUserGroup(params) {
  return request.put(`/nms/v1/shterm/user/group/removeUsers/${params.id}`, wrapperParams(params))
}

// 资源组
export function getResourceGroup(params) {
  return request.get('/nms/v1/resource/groups', {
    params: params
  })
}
export function createResourceGroup(params) {
  return request.post('/nms/v1/resource/groups', wrapperParams(params))
}
export function modifyResourceGroup(params) {
  return request.put(`/nms/v1/resource/groups/${params.id}`, wrapperParams(params))
}
export function removeResourceGroup(id) {
  return request.delete(`/nms/v1/resource/groups/${id}`)
}
export function getResourceGroupDetail(id) {
  return request.get(`/nms/v1/resource/groups/${id}`)
}
export function getAddResourceGroup(id, params) {
  return request.get(`/nms/v1/resource/groups/listDevs/${id}`, {
    params: params
  })
}
// 关联资产组，移除资产组
export function relateResourceGroup(params) {
  return request.put(`/nms/v1/resource/groups/relateDevs/${params.id}`, wrapperParams(params))
}
export function deleteResourceGroup(params) {
  return request.put(`/nms/v1/resource/groups/removeDevs/${params.id}`, wrapperParams(params))
}
// 规则
export function getControl(params) {
  return request.get('/nms/v1/shterm/rule', { params: params })
}
export function getControlDetail(id) {
  return request.get(`/nms/v1/shterm/rule/${id}`)
}
export function createControl(params) {
  return request.post('/nms/v1/shterm/rule', wrapperParams(params))
}
export function modifyControl(params) {
  return request.put(`/nms/v1/shterm/rule/${params.id}`, wrapperParams(params))
}
export function removeControl(id) {
  return request.delete(`/nms/v1/shterm/rule/${id}`)
}
// 回话回放
export function playbackAudit(id, params) {
  return request.get(`/nms/v1/resource/audit/playback/${id}`, { params: params })
}
