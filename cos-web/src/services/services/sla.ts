import request from 'utils/request'
import { wrapperParams } from 'utils/index'
import { ISla } from '@/models/sla'

const baseUrl = '/cos/v1/services/slas'
export function getSla(params: Base.IListParams) {
  return request.get<Base.IListData<ISla>>(baseUrl, {
    params
  })
}
export function getSlaDetail(id: number) {
  return request.get<ISla>(`${baseUrl}/${id}`)
}
export function removeSla(id: number) {
  return request.delete(`${baseUrl}/${id}`)
}
export function createSla(params: ISla) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifySla(params: ISla) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function operateSla(action: string, id: number) {
  return request.patch(`${baseUrl}/${id}`, {
    action
  })
}
// 批量上下架
export function batchOperateSla(ids: number[], action: string) {
  return request.patch(`${baseUrl}`, { action, ids })
}
