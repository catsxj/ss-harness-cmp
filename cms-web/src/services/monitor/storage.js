import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getStorages(params) {
  return request.get('/cms/v1/storages', {
    params: params
  })
}
export function getDisks(params) {
  return request.get('/cms/v1/disks', {
    params: params
  })
}
export function getVolumes(params) {
  return request.get('/cms/v1/volumes', {
    params: params
  })
}
export function getPort(params) {
  return request.get('/cms/v1/switches/ports', {
    params: params
  })
}
