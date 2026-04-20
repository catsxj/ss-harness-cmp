import { getToken } from 'utils/auth'

export function goScreenWeb(redirect: string) {
  const { protocol, hostname } = location
  window.open(`${protocol}//${hostname}:60003/scr-web/sso?token=${getToken()}&redirect=${redirect}&systemTitle=${redirect.includes('3d') ? '机房展示' : '大屏展示'}`)
}
