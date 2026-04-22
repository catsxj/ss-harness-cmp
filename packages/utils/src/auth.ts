import Cookies from 'js-cookie'

let TOKEN_KEY = 'CMC_TOKEN'

export function configureAuth(options: { tokenKey: string }): void {
  TOKEN_KEY = options.tokenKey
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function setToken(token: string): string | undefined {
  return Cookies.set(TOKEN_KEY, token)
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY)
}
