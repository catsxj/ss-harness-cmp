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
