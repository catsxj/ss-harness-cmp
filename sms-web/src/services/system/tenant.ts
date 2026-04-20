/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils/index'

const baseUrl = '/sms/v1/tenants'
export function getTenant(params: any) {
  return request.get(baseUrl, {
    params
  })
}
export function checkedTenant(account: string) {
  return request.get(`${baseUrl}/${account}/exist`)
}

export function getTenantTree(params: any) {
  return request.get(`${baseUrl}`, {
    params: {
      condition: JSON.stringify({ condition: 'children' }),
      ...params
    }
  })
}
export function getTenantDetail(id: number) {
  return request.get(`${baseUrl}/${id}/quotas`)
}
// 租户信息
export function getTenantInfo(id: number) {
  return request.get(`${baseUrl}/${id}`)
}
// 租户下用户列表
export function getTenantUserTrans(id: number, params: any) {
  return request.get(`${baseUrl}/${id}/users`, { params })
}
// 租户下服务列表
export function getTenantService(id: number) {
  return request.get(`/cos/v1/services/tenants/${id}/services`)
}
export function createTenant(params: any) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyTenant(params: any) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeTenant(id: number) {
  return request.delete(`${baseUrl}/${id}`)
}
export function getTenantStats(params: any) {
  return request.get(`${baseUrl}/stats`, {
    params: wrapperParams(params)
  })
}
export function getTenantPool(id: number) {
  return request.get(`${baseUrl}/${id}/pools`)
}
export function assignTenantPools(params: any) {
  return request.post(`${baseUrl}/${params.id}/pools`, JSON.stringify(params.poolIds))
}

export function resetTenantPsw(id: number, params: any) {
  return request.patch(`${baseUrl}/${id}/reset`, {
    ...wrapperParams(params)
  })
}

/*
 * action取值为：
 * lock active reset accredit change
 */
export function operateTenant(id: number, action: string, params: any) {
  return request.patch(`${baseUrl}/${id}`, {
    action,
    ...wrapperParams(params)
  })
}
// 租户配额
export function getQuotaTenant(id: number, params: any) {
  return request.get(`/cos/v1/tenants/${id}/quotas`, { params })
}

export function getCscQuotaTenant(params: any) {
  return request.get(`/cos/v1/tenants/${params.tenantId ? params.tenantId : params.target}/quotas`, { params: wrapperParams(params) })
}

export function createQuotaTenant(id: number, params: any) {
  return request.post(`/cos/v1/tenants/${id}/quotas`, wrapperParams(params))
}

export function getTenantBus(id: number, params: any) {
  return request.get(`/sms/v1/tenants/${id}/businesses`, { params })
}
export function createTenantBus(id: number, params: any) {
  return request.post(`/sms/v1/tenants/${id}/businesses`, params)
}
export function createTenantPool(id: number, params: any) {
  return request.post(`/sms/v1/tenants/${id}/pools`, params)
}
export function getOsTenant(params: any) {
  return request.get('/ims/v1/ostenants', {
    params
  })
}
export function createOsTenantt(params: any) {
  return request.post('/ims/v1/ostenants', wrapperParams(params))
}
export function modifyOsTenant(params: any) {
  return request.put(`/ims/v1/ostenants/${params.id}`, wrapperParams(params))
}
export function assignOsTenantt(params: any) {
  return request.post(`/ims/v1/ostenants/${params.id}/tenant`, wrapperParams(params))
}
export function deleteOsTenant(id: number) {
  return request.delete(`/ims/v1/ostenants/${id}/tenant`)
}
export function removeOsTenant(id: number) {
  return request.delete(`/ims/v1/ostenants/${id}`)
}
export function conditionOsTenant(params: any) {
  return request.get('/ims/v1/ostenants/condition', {
    params
  })
}
export function getTrack(params: any) {
  return request.get(`${baseUrl}/track`, {
    params: params
  })
}
export function getUser(params: any) {
  return request.get('/sms/v1/users', { params })
}
// 获取授信
export function getTenantAccount(id: number) {
  return request.get(`/cos/v1/tenants/${id}/account`)
}
// 授信修改
export function createTenantAccount(params: any) {
  return request.post('/cos/v1/tenants/account', wrapperParams(params))
}
export function getApiById(id: number, params: any) {
  return request.get(`/sms/v1/tenants/${id}/apis`, {
    params: params
  })
}
export function updateApi(id: number, params: any) {
  return request.patch(`/sms/v1/tenants/${id}/apis`, params)
}
// 配额
export function getBaseQuotas() {
  return request.get<any, Base.IResponseData>('/cos/v1/quotas/metas')
}

export function getTenantBaseQuotas(id: number) {
  return request.get<any, Base.IResponseData>(`/cos/v1/tenants/${id}/quotas/metas`)
}

// 租户配置用户
export function tenantCongigUser(params: any) {
  return request.post(`/sms/v1/tenants/${params.id}/users`, params.ids)
}

// 租户移除用户
export function tenantRemoveUser(id: number) {
  return request.patch(`/sms/v1/users/${id}/tenants`)
}

// /sms/v1/tenants
// 租户移除用户
export function lockTenant(params: any) {
  return request.patch('/sms/v1/tenants', params)
}

// 导出租户列表
export function exportTenantList(params: any) {
  downloadFile('/sms/v1/tenants/export', params)
}
