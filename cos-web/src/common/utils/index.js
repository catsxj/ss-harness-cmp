/**
 * Created by HaijunZhang on 2019/7/23.
 */
import Clipboard from 'clipboard'
import { getToken } from 'utils/auth'
import dayjs from './day'
export const formaterFormData = (params) => {
  const formData = new FormData()
  Object.keys(params).forEach((key) => {
    formData.append(key, JSON.stringify(params[key]))
  })
  return formData
}
export function wrapperParams(data) {
  return data
  // return { params: JSON.stringify(data) }
}
export const formatEqParams = (params) => {
  return { page: 1, rows: 9999, params: JSON.stringify([{ param: params, sign: 'EQ' }]) }
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
// export const downloadFile = (url, params = {}) => {
//   request
//     .get(url, {
//       // headers: { 'Content-Type': params.fileFormat },
//       responseType: 'blob',
//       // params: wrapperParams(params),
//       options: {
//         isBlob: true
//       }
//     })
//     .then(data => {
//       var ele = document.createElement('a') // 创建下载链接
//       ele.download = 'filename' // 设置下载的名称
//       ele.style.display = 'none' // 隐藏的可下载链接
//       // 字符内容转变成blob地址
//       const blob = new Blob([data])
//       ele.href = URL.createObjectURL(blob)
//       // 绑定点击时间
//       document.body.appendChild(ele)
//       ele.click()
//       // 然后移除
//       document.body.removeChild(ele)
//     })
// }
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
export function makeTimeStamp() {
  return dayjs().format('YYYYMMDDHHmmss')
}
