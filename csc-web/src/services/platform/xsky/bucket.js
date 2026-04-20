import request from 'utils/request'
import { wrapperParams, downloadFile as downloadFiles } from 'utils'

const baseUrl = '/dms/v1/storages/buckets'
export function getBucket(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createBucket(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifyBucket(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeBucket(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function getBucketDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
const objeceUrl = '/dms/v1/storages/bucket/object'
export function getObject(params) {
  return request.get(objeceUrl, {
    params
  })
}

export function uploadFile(params) {
  return request.post(`${objeceUrl}/upload`, wrapperParams(params))
}
export function createDir(params) {
  return request.post(`${objeceUrl}/mkdir`, wrapperParams(params))
}
export function setAcl(params) {
  return request.put(`${objeceUrl}/acl`, wrapperParams(params))
}
export function downloadFile(id) {
  downloadFiles(`/dms/v1/storages/bucket/object/${id}/download`)
}

export function removeObject(id) {
  return request.delete(`${objeceUrl}/${id}`)
}

export function getObjectDetail(id) {
  return request.get(`${objeceUrl}/${id}`)
}
