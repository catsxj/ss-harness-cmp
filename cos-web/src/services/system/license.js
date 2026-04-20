/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'
const baseUrl = '/sms/v1/config'

export function getServer(params) {
  return request.get(`${baseUrl}/servers`, {
    params
  })
}
export function getLicense() {
  return request.get(`${baseUrl}/license`)
}
