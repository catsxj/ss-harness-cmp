import request from 'utils/request'
import { wrapperParams } from 'utils/index'

// 图标
const iconUrl = '/cos/v1/icons'
export function getIcon(params:any) {
  return request.get(iconUrl, { params })
}

export function removeIcon(id: number) {
  return request.delete(`${iconUrl}/${id}`)
}

export function createIcon(params:any) {
  return request.post(iconUrl, { params })
}

// 服务菜单
const menuUrl = '/cos/v1/services/menus'
export function getMenu(params:any) {
  return request.get(menuUrl, { params })
}

export function createMenu(params:any) {
  return request.post(menuUrl, wrapperParams(params))
}

export function modifyMenu(params:any) {
  return request.put(`${menuUrl}/${params.id}`, wrapperParams(params))
}

export function removeMenu(id:number) {
  return request.delete(`${menuUrl}/${id}`)
}

export function subnetDetail(id:number) {
  return request.get(`${menuUrl}/${id}`)
}

// 服务列表
const itemUrl = '/cos/v1/services/items'
export function getItems(params:any) {
  return request.get('/cos/v1/cloud/services', { params })
}

export function createItems(params:any) {
  return request.post(itemUrl, wrapperParams(params))
}

export function modifyItems(params:any) {
  return request.put(`${itemUrl}/${params.id}`, wrapperParams(params))
}

export function removeItems(id:number) {
  return request.delete(`${itemUrl}/${id}`)
}

export function itemsDetail(id:number) {
  return request.get(`${itemUrl}/${id}`)
}

// 服务发布
export function itemsRelease(id:number, params:any) {
  return request.patch(`${itemUrl}/${id}`, params)
}

// 服务下架
export function itemsUnRelease(id:number, params:any) {
  return request.patch(`${itemUrl}/${id}`, params)
}

// 绑定流程
export function itemsBindFlow(params:any) {
  return request.patch(`${itemUrl}/${params.id}`, { params })
}

// 服务的绑定流程
export function itemsBindFlows(params:any) {
  return request.get(`${itemUrl}/${params.id}/flow`, { params })
}

// 是否绑定了流程
export function isBindFlow(params:any) {
  return request.get(`${itemUrl}/isBinding`, { params })
}

// 绑定流程的服务列表
export function bindFlowItems(params:any) {
  return request.get(`${itemUrl}/flows/services`, { params })
}

// 使用模板的服务列表
export function templateItems(params:any) {
  return request.get(`${itemUrl}/templates/servicess`, { params })
}

// 租户下的服务列表
export function getTenantServices(id:number, params:any) {
  return request.get(`/cos/v1/services/tenants/${id}/services/able`, {
    params: params
  })
}

// 租户下授权服务列表
export function getTenantQuotaServices(id:number, params:any) {
  return request.get<any, Base.IResponseData>(`/cos/v1/services/tenants/${id}/able`, {
    params: params
  })
}

// 租户下授权服务列表搜索
export function searchServicesList(params:any) {
  return request.get('/cos/v1/cloud/services', {
    params: params
  })
}

export function conditionServicesList(params:any) {
  return request.get('/cos/v1/cloud/services/condition', {
    params: params
  })
}

// 租户下的服务列表
export function getTenantServicesCode(params:any) {
  return request.get('/cos/v1/services/tenants', {
    params
  })
}

// 服务使用记录
const itemsLogUrl = '/cos/v1/services/items/records'
export function itemsLog(params:any) {
  return request.get(itemsLogUrl, { params })
}

export function itemsLogChart(params:any) {
  return request.get(`${itemsLogUrl}/stats`, { params })
}

export function itemsVmLogChart(params:any) {
  return request.get(`${itemsLogUrl}/stats`, params)
}

export function removeItemsLog(id:number) {
  return request.delete(`${itemsLogUrl}/${id}`)
}

// 流程绑定配置列表
const flowBindConfigUrl = '/cos/v1/flows/configs'
export function flowBindConfig(params:any) {
  return request.get(flowBindConfigUrl, { params })
}

export function modifyFlowBindConfig(params:any) {
  return request.put(`${flowBindConfigUrl}/${params.id}`, wrapperParams(params))
}

export function flowBindConfigDetail(params:any) {
  return request.get(`${flowBindConfigUrl}/${params.id}`, { params })
}

export function flowQueryBindConfigDetail(params:any) {
  return request.get(`${flowBindConfigUrl}/query`, { params })
}

const flowBindControlConfigUrl = '/cos/v1/flows/tenants'
export function flowBindControlConfig(params:any) {
  return request.get(flowBindControlConfigUrl, { params })
}

export function modifyFlowBindControlConfig(params:any) {
  return request.post(`${flowBindControlConfigUrl}`, wrapperParams(params))
}

export function deleteFlow(params:any) {
  return request.delete(`${flowBindControlConfigUrl}/${params.id}`)
}

// 被授权服务的租户
export function authTenant(id:number) {
  return request.get(`${itemUrl}/${id}/tenants`)
}

//  批量服务授权租户
export function authAllTenant(params:any) {
  return request.patch(`${itemUrl}/tenants/grant`, wrapperParams(params))
}

// 多服务授权租户
export function authsAllTenant(id:number, params:any) {
  return request.post(`/cos/v1/services/tenants/${id}/grant`, wrapperParams(params))
}

// 服务授权租户
export function itemsAuthTenant(id:number, params:any) {
  return request.patch(`${itemUrl}/${id}/grant`, wrapperParams(params))
}

// 通过租户删除租户服务关系
export function removeTenantItems(id:number) {
  return request.delete(`${itemUrl}/tenants/${id}`)
}

export function patchServices(action:string, params:any) {
  return request.patch(`/cos/v1/services/items//${params.id}`, { action: action, ...wrapperParams(params) })
}
