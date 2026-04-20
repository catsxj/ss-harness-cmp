/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils/index'
import { IUser } from '@/models/user'

const baseUrl = '/sms/v1/users'
export function getUser(params: Base.IListParams) {
  return request.get<Base.IListData<IUser>>(baseUrl, {
    params
  })
}
export function getUserDetail(id: number) {
  return request.get<IUser>(`${baseUrl}/${id}`)
}
export function modifyUser(params: IUser) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function changePassword(id: number, params: { oldPassword: string; password: string }) {
  return request.patch(`${baseUrl}/${id}/pwd`, params)
}
