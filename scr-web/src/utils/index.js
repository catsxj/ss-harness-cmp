/**
 * Created by HaijunZhang on 2019/7/23.
 */
import { getToken } from 'utils/auth'

export function wrapperParams (data) {
  return { params: JSON.stringify(data) }
}
export const formatEqParams = params => {
  return { page: 1, rows: 1000, params: JSON.stringify([{ param: params, sign: 'EQ' }]) }
}
export const downloadFile = (url, params = {}) => {
  let str = ''
  Object.keys(params).forEach(item => {
    str += `&${item}=${params[item]}`
  })
  window.location.href = encodeURI(`/api${url}?token=${getToken()}${str}`)
}
export const getQuery = hash => {
  const queryArr = hash.split('?')
  if (queryArr.length === 1) {
    return {}
  }
  const query = {}
  queryArr[1].split('&').forEach(item => {
    const [key, value] = item.split('=')
    query[key] = value
  })
  return query
}
