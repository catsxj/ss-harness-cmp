/* eslint-disable no-undef */
/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils/index'
import type { IUser } from '@/models/user'

const baseUrl = '/sms/v1/users'
export function getUser(params: Base.IListParams) {
  return request.get<Base.IListData<IUser>>(baseUrl, {
    params,
  })
}
export function getUserDetail(id: number) {
  return request.get<IUser>(`${baseUrl}/${id}`)
}
export function createUser(params: IUser) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyUser(params: IUser) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeUser(id: number) {
  return request.delete(`${baseUrl}/${id}`)
}

export function accreditManager(id: number, roleIds: number[]) {
  return request.patch(`${baseUrl}/${id}/accredit`, roleIds)
}
export function resetManager(id: number, password: string) {
  return request.patch<unknown, Base.IResponseData>(`${baseUrl}/${id}/reset`, { password })
}
export function operateManager(id: number, action: string) {
  return request.patch(`${baseUrl}/${id}`, { action })
}
export function batchOperateManager(ids: number[], action: string) {
  return request.patch(`${baseUrl}`, { action, ids })
}
export function changePassword(id: number, params: { oldPassword: string; password: string }) {
  return request.patch(`${baseUrl}/${id}/pwd`, params)
}
export function checkUser(id: number) {
  return request.get(`${baseUrl}/${id}/status`)
}
export function getRolesByUser(id: number) {
  return request.get(`${baseUrl}/${id}/roles`)
}
export function getTrack(params: Base.IListParams) {
  return request.get(`${baseUrl}/track`, {
    params,
  })
}
export function exportUser(params: Base.IListParams) {
  downloadFile(`${baseUrl}/export`, params)
}
