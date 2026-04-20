import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getRegion(params) {
  return request.get('/ims/v1/regions', { params })
}
