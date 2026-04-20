import { getToken } from 'utils/auth'

export function wrapperParams(data: unknown): { params: string } {
  return { params: JSON.stringify(data) }
}

export function formatEqParams(params: unknown): { page: number; rows: number; params: string } {
  return { page: 1, rows: 1000, params: JSON.stringify([{ param: params, sign: 'EQ' }]) }
}

export function downloadFile(url: string, params: Record<string, string> = {}): void {
  let str = ''
  Object.keys(params).forEach(item => {
    str += `&${item}=${params[item]}`
  })
  window.location.href = encodeURI(`/api${url}?token=${getToken()}${str}`)
}

export function getQuery(hash: string): Record<string, string> {
  const queryArr = hash.split('?')
  if (queryArr.length === 1) return {}
  const query: Record<string, string> = {}
  queryArr[1].split('&').forEach(item => {
    const [key, value] = item.split('=')
    query[key] = value
  })
  return query
}
