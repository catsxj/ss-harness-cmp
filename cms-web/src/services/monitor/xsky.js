import request from 'utils/request'
import { wrapperParams } from 'utils'
const baseUrl = '/cms/v1/xsky'
export function getHost(params) {
  return request.get(`${baseUrl}/hosts`, {
    params
  })
}
export function getPool(params) {
  return request.get(`${baseUrl}/storages/pools`, {
    params
  })
}
export function getObjectUser(params) {
  return request.get(`${baseUrl}/object/user`, {
    params
  })
}
export function getObjectRouter(params) {
  return request.get(`${baseUrl}/object/router`, {
    params
  })
}
export function getBucket(params) {
  return request.get(`${baseUrl}/buckets`, {
    params
  })
}
export function getOsd(params) {
  return request.get(`${baseUrl}/ceph/osds`, {
    params
  })
}
export function getDisk(params) {
  return request.get(`${baseUrl}/disks`, {
    params
  })
}
export function getVolume(params) {
  return request.get(`${baseUrl}/volumes`, {
    params
  })
}
export function getFileSystems(params) {
  return request.get(`${baseUrl}/fileSystems`, {
    params
  })
}
