import type { App, ComponentPublicInstance } from 'vue'
import request from 'utils/request'
import { useAppStore } from '@/stores/app'

const { host, hash } = location

function sendLog(msg: unknown, _vm: unknown, info: string, level: 'error' | 'warning'): void {
  const appStore = useAppStore()
  request.post('http://10.20.51.92:7001/log', {
    service: 'CMC',
    level,
    username: appStore.userData?.username,
    host,
    view: hash,
    msg: `${msg}`,
    info
  })
}

export function registerErrorHandlers(app: App): void {
  if (process.env.NODE_ENV === 'development') {
    app.config.errorHandler = (err: unknown, vm: ComponentPublicInstance | null, info: string) => {
      console.error(err, vm, info)
      // sendLog(err, vm, info, 'error')
    }
    app.config.warnHandler = (msg: string, vm: ComponentPublicInstance | null, info: string) => {
      console.warn(msg, vm, info)
      // sendLog(msg, vm, info, 'warning')
    }
  }
}

// 保留 sendLog 导出，便于运行时手动上报
export { sendLog }
