import Cookies from 'js-cookie'
import { tokenKey } from '@/config'

export function getToken(): string | undefined {
  return Cookies.get(tokenKey)
}

export function setToken(token: string): string | undefined {
  return Cookies.set(tokenKey, token)
}

export function removeToken(): void {
  Cookies.remove(tokenKey)
}
