import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cos/v1/workorders'
export function getworkOrder(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getworkOrderDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}

export function removeworkOrder(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function recordWorkOrder(id) {
  return request.get(`${baseUrl}/${id}/records`)
}

export function createRecordsWorkOrder(params) {
  return request.post(`${baseUrl}/${params.orderId}/records`, wrapperParams(params))
}
