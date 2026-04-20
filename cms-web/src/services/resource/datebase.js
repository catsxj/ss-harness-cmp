import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getRds(params) {
  return request.get('/pms/v1/rds', { params })
}

export function getKvs(params) {
  return request.get('/pms/v1/kvs', { params })
}
