/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const baseUrl = '/sms/v1/projects'
export function getProject(params) {
  return request.get(baseUrl, {
    params
  })
}
