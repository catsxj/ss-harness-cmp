/**
 * Created by HaijunZhang on 2019/7/23.
 */
import { getToken } from 'utils/auth'
import dayjs from './day'
import Clipboard from 'clipboard'

export function wrapperParams(data) {
  return data
  // return { params: JSON.stringify(data) }
}
export const copyText = (text, event, successCallback, errorCallback) => {
  const clipboard = new Clipboard(event.target, {
    text: () => text
  })
  clipboard.on('success', () => {
    successCallback && successCallback()
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    errorCallback && errorCallback()
    clipboard.destroy()
  })
  clipboard.onClick(event)
}
export const formatEqParams = (params) => ({ page: 1, rows: 9999, params: JSON.stringify([{ param: params, sign: 'EQ' }]) })
export const downloadFile = (url, params = {}) => {
  let str = ''
  Object.keys(params).forEach((item) => {
    str += `&${item}=${params[item]}`
  })
  window.location.href = encodeURI(`/api${url}?token=${getToken()}${str}`)
}
export const getQuery = (hash) => {
  const queryArr = hash.split('?')
  if (queryArr.length === 1) {
    return {}
  }
  const query = {}
  queryArr[1].split('&').forEach((item) => {
    const [key, value] = item.split('=')
    query[key] = value
  })
  return query
}
// ip比较大小
export const compareIp = (ip1, ip2) => {
  const ip1Arr = ip1.split('.')
  const ip2Arr = ip2.split('.')
  let flag
  for (let i = 0; i < 4; i += 1) {
    if (Number(ip1Arr[i]) > Number(ip2Arr[i])) {
      flag = 0
      break
    } else if (Number(ip1Arr[i]) < Number(ip2Arr[i])) {
      flag = 1
    }
  }
  return flag
}
export function makeTimeStamp() {
  return dayjs().format('YYYYMMDDHHmmss')
}
export function handleSearchParam(params) {
  // 设置参数
  const objParams = {}
  function setParams(sign, key, value) {
    if (objParams[sign]) {
      objParams[sign][key] = value
    } else {
      objParams[sign] = {
        [key]: value
      }
    }
  }
  // 将参数处理为对象
  for (const a in params) {
    const value = params[a]
    // 对参数进行处理，去除空参数
    if (value === '' || value === undefined || value === null) continue
    // 对key值进行处理
    const [key, sign = 'EQ'] = a.split(':')
    // 将sign全部转换为大写
    const signs = sign.toLocaleUpperCase()
    if (signs === 'RANGE') {
      const [first, second] = value
      setParams('GET', key, first)
      setParams('LET', key, second)
      continue
    }
    setParams(signs, key, value)
  }
  const result = []
  for (const a in objParams) {
    result.push({ param: objParams[a], sign: a })
  }
  return JSON.stringify(result)
}
