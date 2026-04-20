import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/ims/v1/hmc'

export function getServersPorts(id) {
  return request.get(`${baseUrl}/servers/${id}/heas`)
}
export function getIOadapters(params) {
  return request.get(`${baseUrl}/ioadapters`, {
    params: params
  })
}
const partitionUrl = '/ims/v1/hmc/partitions'

export function getPartitions(params) {
  return request.get(partitionUrl, {
    params: params
  })
}
const serverUrl = '/ims/v1/hmc/servers'

export function getServers(params) {
  return request.get(serverUrl, {
    params: params
  })
}
