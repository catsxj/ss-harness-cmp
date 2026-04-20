import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/dms/v1/object/user'
export function getObjectUser(params) {
  return request.get(baseUrl, {
    params
  })
}
