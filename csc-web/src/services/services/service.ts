import { IService } from '@/models/service'
import request from 'utils/request'
import { wrapperParams } from 'utils/index'

export function getVendorTypes(params: any) {
  return request.get('/ims/v1/vendors/condition', {
    params: { condition: JSON.stringify(params) }
  })
}
const baseUrl = '/cos/v1/cloud/services'
export function getService(params: Base.IListParams) {
  return request.get<Base.IListData<IService>>(baseUrl, {
    params
  })
}
export function getServiceDetail(id: number) {
  return request.get<IService>(`${baseUrl}/${id}`)
}
export function createService(params: IService) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyService(params: IService) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeService(id: number) {
  return request.delete(`${baseUrl}/${id}`)
}
export function batchOperateServices(ids: number[], action: 'PUBLISHED' | 'UNPUBLISHED') {
  return request.patch(baseUrl, { action, ids })
}
export function operateService(action: string, id: number) {
  return request.patch(`${baseUrl}/${id}`, {
    action
  })
}
// 产品树形列表
export function getServiceTree() {
  return request.get('/cos/v1/services/categories/tree')
}

// 单点登录
export function getSSOToken(params: any) {
  return request.post('/sms/v1/users/login/ndITOM', params)
}
