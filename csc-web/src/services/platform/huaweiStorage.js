import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getStorages(params) {
  return request.get('/dms/v1/storages', {
    params: params
  })
}
export function getMdisks(params) {
  return request.get('/dms/v1/storages/mdisks', {
    params: params
  })
}
