import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

export function getItmsAll(params) {
  return request.get('/cos/v1/itsms/all', { params })
}

export function getItmsApplys(params) {
  return request.get('/cos/v1/itsms/service/applys', { params })
}

export function getItmsEvent(params) {
  return request.get('/cos/v1/itsms/events', { params })
}
