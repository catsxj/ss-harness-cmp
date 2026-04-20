import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getHost(params) {
  return request.get('/cms/v1/xsky/hosts', {
    params
  })
}
export function getPool(params) {
  return request.get('/cms/v1/xsky/storages/pools', {
    params
  })
}
export function getObjectUser(params) {
  return request.get('/cms/v1/xsky/object/user', {
    params
  })
}
export function getObjectRouter(params) {
  return request.get('/cms/v1/xsky/object/router', {
    params
  })
}
export function getBucket(params) {
  return request.get('/cms/v1/xsky/buckets', {
    params
  })
}
export function getOsd(params) {
  return request.get('/cms/v1/xsky/ceph/osds', {
    params
  })
}
export function getDisk(params) {
  return request.get('/cms/v1/xsky/disks', {
    params
  })
}
export function getVolume(params) {
  return request.get('/cms/v1/xsky/volumes', {
    params
  })
}
export function getFileSystems(params) {
  return request.get('/cms/v1/xsky/fileSystems', {
    params
  })
}
