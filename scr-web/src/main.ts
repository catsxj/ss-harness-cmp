import { createApp } from 'vue'
import type { App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { registerComponents } from './components'

let app: VueApp | null = null

function render(props: Record<string, unknown> = {}) {
  const container = props.container as Element | undefined
  app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.use(ElementPlus, { size: 'small' })
  registerComponents(app)

  const mountEl = container
    ? (container.querySelector('#app') as Element)
    : document.querySelector('#app')
  app.mount(mountEl as Element)
}

// Qiankun lifecycle
export async function bootstrap() {
  // 初始化
}

export async function mount(props: Record<string, unknown>) {
  render(props)
}

export async function unmount() {
  app?.unmount()
  app = null
}

// 独立运行
if (!(window as unknown as Record<string, unknown>).__POWERED_BY_QIANKUN__) {
  render()
}
