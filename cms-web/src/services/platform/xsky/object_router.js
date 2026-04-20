import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/dms/v1/object/router'
export function getObjectRouter(params) {
  return request.get(baseUrl, {
    params
  })
}
