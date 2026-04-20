import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/ims/v1/vpcs'
export function getVpc(params) {
  return request.get(baseUrl, {
    params: params
  })
}
