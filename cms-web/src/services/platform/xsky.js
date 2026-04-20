import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getOsd(params) {
  return request.get('/dms/v1/ceph/osds', {
    params: params
  })
}
const baseUrl = '/dms/v1/files/systems'
export function getSystem(params) {
  return request.get(baseUrl, {
    params
  })
}
