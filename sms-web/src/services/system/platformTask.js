import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/sms/v1/system/tasks'

export function getTasks(params) {
  return request.get(baseUrl, {
    params
  })
}
