import request from 'utils/request'
import { wrapperParams } from 'utils'

const recyclesUrl = '/cos/v1/recycles'
export function getRecycle(params) {
  return request.get(recyclesUrl, {
    params
  })
}

export function patchRecycle(params) {
  return request.patch(`${recyclesUrl}/${params.id}/restore`, {
    ...wrapperParams(params)
  })
}

export function deleteRecycle(params) {
  return request.post('/cos/v1/resource/cancelation/all', params)
}

export function patchToRecycle(params) {
  return request.patch(`/pms/v1/${params.url}/${params.id}/recycle`)
}

export function checkUnderway(params) {
  return request.get('/cos/v1/orders/underway/check', { params })
}
