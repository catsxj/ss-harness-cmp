import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getDcs () {
  return request.get('/ims/v1/dcs', {
    params: { page: 1, rows: 10000 }
  })
}

export function getOverview () {
  return request.get('/cos/v1/data/center/overview')
}

export function getUsed () {
  return request.get('/cos/v1/data/center/used')
}

export function getDcOverview () {
  return request.get('/cos/v1/data/center')
}

export function getDcItem (dcId = 0) {
  return request.get(`/cos/v1/data/center/${dcId}`)
}

export function getDcResource (dcId = 0) {
  return request.get(`/cos/v1/data/center/${dcId}/resource`, { params: wrapperParams({ time: 'Weeks' }) })
}

export function getDcLink (dcId = 0) {
  return request.get(`/cos/v1/data/center/${dcId}/links`)
}

export function getDcList () {
  return request.get('/cos/v1/data/center/relation')
}
