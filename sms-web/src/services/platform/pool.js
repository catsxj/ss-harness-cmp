import request from 'utils/request'
import { wrapperParams } from 'utils/index'

const baseUrl = '/ims/v1/pool/groups'

export function getPool(params, options = {}) {
  return request.get(baseUrl, {
    params,
    ...options
  })
}
export function getPoolConditions(params) {
  return request.get(`${baseUrl}/condition`, {
    params
  })
}
