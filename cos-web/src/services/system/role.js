/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

const roleUrl = '/sms/v1/roles'

export function getRole(params) {
  return request.get(roleUrl, {
    params
  })
}
export function getRoleDetail(id) {
  return request.get(`${roleUrl}/${id}`)
}
