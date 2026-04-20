import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getCms(params) {
  return request.get('/pms/v1/cms', { params })
}
