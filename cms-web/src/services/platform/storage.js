import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getStorages(params) {
  return request.get('/dms/v1/storages', {
    params: params
  })
}

const diskUrl = '/dms/v1/storages/disks'

export function getDisks(params) {
  return request.get(diskUrl, {
    params: params
  })
}

const poolUrl = '/dms/v1/storages/pools'

export function getPools(params) {
  return request.get(poolUrl, {
    params: params
  })
}
