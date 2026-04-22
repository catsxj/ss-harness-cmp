import request from 'utils/request.js'
import { wrapperParams } from 'utils/index'

const baseUrl = '/cop/v1/identifications'

export function getIdents(params: any): any {
  return request.get(baseUrl, {
    params
  })
}
// simple修改
export function getIdentsBySimple(params: any): any {
  return request.get(`${baseUrl}/simple`, {
    params
  })
}
export function getIdentsDetail(id: number) {
  return request.get(`${baseUrl}/${id}`)
}
export function createIdents(params: any) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyIdents(params: any) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeIdents(id: number) {
  return request.delete(`${baseUrl}/${id}`)
}
export function applyIdents(id: number) {
  return request.patch(`${baseUrl}/${id}`)
}
