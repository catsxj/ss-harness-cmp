import Clipboard from 'clipboard'
import { getToken } from './auth'
import dayjs from './day'

export function wrapperParams<T>(data: T): T {
  return data
}

export const formatEqParams = (params: unknown) => {
  return { page: 1, rows: 9999, params: JSON.stringify([{ param: params, sign: 'EQ' }]) }
}

export const copyText = (
  text: string,
  event: Event,
  successCallback?: () => void,
  errorCallback?: () => void
): void => {
  const target = event.target as HTMLElement
  const clipboard = new Clipboard(target, { text: () => text })
  clipboard.on('success', () => {
    successCallback?.()
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    errorCallback?.()
    clipboard.destroy()
  })
  clipboard.onClick(event as any)
}

export const downloadFile = (url: string, params: Record<string, unknown> = {}): void => {
  let str = ''
  Object.keys(params).forEach((key) => {
    str += `&${key}=${params[key]}`
  })
  window.location.href = encodeURI(`/api${url}?token=${getToken()}${str}`)
}

export const getQuery = (hash: string): Record<string, string> => {
  const queryArr = hash.split('?')
  if (queryArr.length === 1) return {}
  const query: Record<string, string> = {}
  queryArr[1].split('&').forEach((item) => {
    const [key, value] = item.split('=')
    query[key] = value
  })
  return query
}

export const compareIp = (ip1: string, ip2: string): number | undefined => {
  const ip1Arr = ip1.split('.')
  const ip2Arr = ip2.split('.')
  let flag: number | undefined
  for (let i = 0; i < 4; i++) {
    if (Number(ip1Arr[i]) > Number(ip2Arr[i])) {
      flag = 0
      break
    } else if (Number(ip1Arr[i]) < Number(ip2Arr[i])) {
      flag = 1
    }
  }
  return flag
}

export function makeTimeStamp(): string {
  return dayjs().format('YYYYMMDDHHmmss')
}

// 替代 cmp-element/utils 的 handleSearchParam：过滤空值并序列化为 EQ/LIKE 查询参数
export interface SearchParamItem {
  param: Record<string, unknown>
  sign?: 'EQ' | 'LIKE' | 'IN' | 'GT' | 'LT'
}

export function handleSearchParam(
  params: Record<string, unknown>,
  sign: SearchParamItem['sign'] = 'LIKE'
): string {
  const filtered: Record<string, unknown> = {}
  Object.keys(params).forEach((key) => {
    const v = params[key]
    if (v !== undefined && v !== null && v !== '') filtered[key] = v
  })
  return JSON.stringify([{ param: filtered, sign }])
}
