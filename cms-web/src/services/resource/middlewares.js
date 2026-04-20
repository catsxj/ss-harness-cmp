import request from 'utils/request'
import { wrapperParams } from 'utils'
const baseAssUrl = '/pms/v1/ass'
export function getAss(params) {
  return request.get(baseAssUrl, { params })
}

const baseLbsUrl = '/pms/v1/lbs'
export function getLbs(params) {
  return request.get(baseLbsUrl, { params })
}

const baseCcsUrl = '/pms/v1/ccs'
export function getCcs(params) {
  return request.get(baseCcsUrl, { params })
}
