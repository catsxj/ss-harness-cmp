/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils/index'
import { IDepart } from '@/models/depart'

const baseUrl = '/sms/v1/departments'

export function getDepart(params: any) {
  return request.get<IDepart[]>(baseUrl, {
    params
  })
}
export function getDepartLazy(params: any) {
  return request.get<IDepart[]>(`${baseUrl}/listByParentId`, {
    params
  })
}
export function getDepartDetail(id: number) {
  return request.get<IDepart>(`${baseUrl}/${id}`)
}
export function createDepart(params: IDepart) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyDepart(params: IDepart) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeDepart(id: number) {
  return request.delete(`${baseUrl}/${id}`)
}
