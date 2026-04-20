import { registerMicroApps, start, addGlobalUncaughtErrorHandler } from 'qiankun'
import { message } from 'ant-design-vue'
import NProgress from 'nprogress'
import store from '@/store'
import 'nprogress/nprogress.css'
import './actions'
import { getMicroApp } from './config'

const startApp = async () => {
  const apps = await getMicroApp()
  registerMicroApps(apps, {
    beforeLoad: [
      () => {
        NProgress.start()
        store.commit('SET_APP_LOADING', true)
        // console.log('[LifeCycle] before load %c%s', 'color: green;', app.name)
        return Promise.resolve()
      }
    ],
    afterMount: [
      () => {
        NProgress.done()
        store.commit('SET_APP_LOADING', false)
        // console.log('[LifeCycle] after mount %c%s', 'color: green;', app.name)
        return Promise.resolve()
      }
    ],
    afterUnmount: [
      () => {
        // console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name)
        return Promise.resolve()
      }
    ]
  })
  start({
    prefetch: 'all'
  })
}
/**
 * 添加全局的未捕获异常处理器
 */
addGlobalUncaughtErrorHandler((event: Event | string) => {
  console.error(event)
  const { message: msg } = event as any
  // 加载失败时提示
  if (msg && msg.includes('died in status LOADING_SOURCE_CODE')) {
    message.error('微应用加载失败，请检查应用是否可运行')
  }
})
export default startApp
