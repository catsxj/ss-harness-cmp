import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cos/v1/documents'
export function getDocument(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getDocumentDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createDocument(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyDocument(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeDocument(id) {
  return request.delete(`${baseUrl}/${id}`)
}

const categoryUrl = '/cos/v1/documents/category'
export function getCategory(params) {
  return request.get(categoryUrl, {
    params
  })
}
export function getCategoryDetail(id) {
  return request.get(`${categoryUrl}/${id}`)
}
export function createCategory(params) {
  return request.post(categoryUrl, wrapperParams(params))
}
export function modifyCategory(params) {
  return request.put(`${categoryUrl}/${params.id}`, wrapperParams(params))
}
export function removeCategory(id) {
  return request.delete(`${categoryUrl}/${id}`)
}

export function uploadImage(params) {
  return request.post('/cos/v1/documents/pictures', params, {
    headers: { 'Content-Type': 'multipart/form-data', BsmAjaxHeader: true, options: { noSeri: true } }
  })
}
