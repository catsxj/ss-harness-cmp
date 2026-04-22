/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'

const baseUrl = '/sms/v1/users'
export function getUser(params) {
  return request.get(baseUrl, {
    params
  })
}
