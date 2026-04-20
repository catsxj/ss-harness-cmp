import axios from 'axios'
import NProgress from 'nprogress'
import qs from 'qs'
import 'nprogress/nprogress.css'
import { ElNotification } from 'element-plus'
import { getToken } from 'utils/auth'

const codeMessage: Record<number, string> = {
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
  headers: { 'Content-Type': 'application/json', BsmAjaxHeader: 'true' },
  timeout: 20000,
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: 'indices' })
  }
})

function finishCallback() {
  NProgress.done()
}

function handleError(response: { status: number; statusText: string; config: { url: string } }) {
  if (!response) return
  const errorText = codeMessage[response.status] || response.statusText
  ElNotification({
    type: 'error',
    title: `请求错误 ${response.status}: ${response.config.url}`,
    message: errorText
  })
  const error = new Error(errorText) as Error & { name: string; response: unknown }
  error.name = String(response.status)
  error.response = response
  throw error
}

axiosInstance.interceptors.request.use(
  (config) => {
    const options = (config.headers as Record<string, unknown>)?.options as Record<string, unknown> || {}
    NProgress.start()
    if (config.method === 'get') {
      config.url = `${config.url}?t=${new Date().getTime()}`
    } else if (config.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      config.data = qs.stringify(config.data || {})
    }
    config.headers.token = getToken()
    delete (config.headers as Record<string, unknown>).options
    ;(config as Record<string, unknown>).options = options
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (data) => {
    finishCallback()
    const responseData = data.data
    const options = (data.config as Record<string, unknown>).options as Record<string, unknown> || {}
    if (!responseData.success) {
      switch (responseData.status) {
        case '402':
          location.href = '/#/license'
          break
        case '401':
        case '509': {
          const { protocol, hostname } = location
          location.href = `${protocol}//${hostname}:60006/#/login`
          break
        }
      }
      if (!options.ignoreError) {
        ElNotification({
          message: responseData.message || responseData.data,
          type: 'error'
        })
      }
    }
    return responseData
  },
  (error) => {
    finishCallback()
    handleError(error.response)
    return Promise.reject(error)
  }
)

export default axiosInstance
