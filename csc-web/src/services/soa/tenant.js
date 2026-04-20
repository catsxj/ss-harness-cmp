/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getDashboard(params) {
  return request.get('/cos/v1/soa/tenants/resources', {
    params: wrapperParams(params)
  })
}
export function getAz(params) {
  return request.get('/cos/v1/soa/tenants', {
    params: wrapperParams(params)
  })
}
