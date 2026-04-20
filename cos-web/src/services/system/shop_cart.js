import request from 'utils/request'
import { wrapperParams } from 'utils'
const shoppingUrl = '/cos/v1/shopping/cart'

export function getShoppingCartDetail(id) {
  return request.get(`${shoppingUrl}/${id}`)
}

export function putShoppingCart(id, params) {
  return request.put(`${shoppingUrl}/${id}`, wrapperParams(params))
}
