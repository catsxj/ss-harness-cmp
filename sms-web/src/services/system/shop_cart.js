import request from 'utils/request'
import { wrapperParams } from 'utils'
const shoppingUrl = '/cos/v1/shopping/cart'

export function getShoppingCart(params) {
  return request.get(shoppingUrl, {
    params
  })
}
export function removeShoppingCart(id) {
  return request.delete(`${shoppingUrl}/${id}`)
}
export function getShoppingCartDetail(id) {
  return request.get(`${shoppingUrl}/${id}`)
}
export function emptyShoppingCart(params) {
  return request.put(shoppingUrl, wrapperParams(params))
}

export function putShoppingCart(id, params) {
  return request.put(`${shoppingUrl}/${id}`, wrapperParams(params))
}
