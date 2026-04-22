/**
 * Created by Zhang Haijun on 2017/8/24.
 * axios#request(config)
 * axios#get(url[, config])
 * axios#delete(url[, config])
 * axios#head(url[, config])
 * axios#options(url[, config])
 * axios#post(url[, data[, config]])
 * axios#put(url[, data[, config]])
 * axios#patch(url[, data[, config]])
 */
import axios from 'axios'
import qs from 'qs'

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
}
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', BsmAjaxHeader: true },
  timeout: 20000,
  paramsSerializer: params => {
    return qs.stringify(params, { arrayFormat: 'indices' })
  }
})
// 请求完成回调
const finishCallback = function () {
}
// 报错处理
const handleError = function (response) {
  if (!response) return // 容错处理
  const errorText = codeMessage[response.status] || response.statusText
  // Notification({
  //   type: 'error',
  //   title: `请求错误 ${response.status}: ${response.config.url}`,
  //   message: errorText
  // })
  const error = new Error(errorText)
  error.name = response.status
  error.response = response
  throw error
}
axiosInstance.interceptors.request.use(
  config => {
    const {
      headers: { options = {} }
    } = config
    if (config.method === 'get') {
      // 清除get缓存
      config.url = `${config.url}?t=${new Date().getTime()}`
    }
    config.headers.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlLZXkiOiIxMjE0NTQ2NzgyIiwiY2F0YWxvZyI6Ik1hbmFnZXIiLCJuYW1lIjoi6LaF57qn566h55CG5ZGYIiwiZXhwIjoxNjIzODI5OTA1LCJ1dWlkIjoxLCJhY2NvdW50IjoiYWRtaW4ifQ.H1TLrKni0z4xp3M55SUbUyLImgELqrZhCYrPXoKmucY'
    delete config.headers.options
    config.options = options
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
axiosInstance.interceptors.response.use(
  data => {
    // const requestKey = getRequestIdentify(data.config);
    // removePending(requestKey);
    finishCallback()
    const responseData = data.data
    const { options } = data.config
    if (!responseData.success) {
      switch (responseData.status) {
        case '402':
          location.href = '/#/license'
          break
        case '401':
        case '509':
          break
        default:
      }
      if (!options.ignoreError) {
      }
    }
    return responseData
  },
  error => {
    finishCallback()
    handleError(error.response)
    return Promise.reject(error)
  }
)
export default axiosInstance
