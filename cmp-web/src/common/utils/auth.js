/**
 * Created by HaijunZhang on 2018/11/16.
 */
import Cookies from 'js-cookie'
import { tokenKey } from '@/config'

export function getToken() {
  return Cookies.get(tokenKey)
}

export function setToken(token) {
  return Cookies.set(tokenKey, token)
}

export function removeToken() {
  return Cookies.remove(tokenKey)
}
