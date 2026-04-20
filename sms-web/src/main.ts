import './public-path'
import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElIcons from '@element-plus/icons-vue'

import App from './App.vue'
import router, { asyncRouterMap } from './router'
import setupPermissionGuard from './permission'
import { registerErrorHandlers } from './errorLog'
import { registerDirectives } from './common/directive'
import { registerGlobalComponents } from './common/components'
import { useAppStore, usePermissionStore } from './stores'
import actions from './shared/action'
import './icons'
import '@/common/css/element-variables.scss'

// TODO: cmp-element / cmp-echarts / cmp-socket - 自研包不兼容 Vue 3
// 原 Vue.use(CmpElement, { rules }) 已移除；组件层在 Stage 2 直接使用 Element Plus
// rules 由 @/validate/index.ts 直接 import 使用

let instance: VueApp | null = null
const pinia = createPinia()

function render(props: Record<string, any> = {}): void {
  const { container, appPath = '' } = props
  instance = createApp(App)
  instance.use(pinia)
  instance.use(router)
  instance.use(ElementPlus, { size: 'small' })
  Object.entries(ElIcons).forEach(([name, comp]) => {
    instance!.component(`ElIcon${name}`, comp as any)
  })
  registerDirectives(instance)
  registerGlobalComponents(instance)
  registerErrorHandlers(instance)
  setupPermissionGuard(router)

  const mountEl = container ? container.querySelector('#app') : '#app'
  instance.mount(mountEl)

  useAppStore().setAppPath(appPath)
}

if (!(window as any).__POWERED_BY_QIANKUN__) {
  console.log('独立运行子应用')
  render()
}

export async function bootstrap(): Promise<void> {
  console.log('sms app bootstrapped')
}

export async function mount(props: any): Promise<void> {
  console.log('sms app mounted')
  render(props)
  actions.init(props, (state: any) => {
    const { permissions, userData } = state
    const appStore = useAppStore()
    const permissionStore = usePermissionStore()
    if (userData) appStore.setUserData(userData)
    if (!permissionStore.addRoutes && permissions) {
      permissionStore.generateRoutes(asyncRouterMap, router, permissions)
    }
  })
}

export async function unmount(): Promise<void> {
  instance?.unmount()
  instance = null
}
