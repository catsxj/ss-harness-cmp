import { createRouter, createWebHistory, type Router } from 'vue-router'
import constantRouter from './modules/constant'
import systemMap from './modules/system'
import { baseUrl } from '@/config'

export const asyncRouterMap: Record<string, () => Promise<unknown>> = {
  Home: () => import('@/layouts/home.vue'),
  App: () => import('@/layouts/app.vue'),
  ...systemMap
}

// Qiankun 下使用 baseUrl (/sms-web) 作为 router base 匹配 activeRule
// 独立运行时也保留 /sms-web 前缀以保持路径一致
const routerBase = (window as any).__POWERED_BY_QIANKUN__ ? baseUrl : (process.env.VUE_APP_BASEURL || '/')

const router: Router = build()

function build(): Router {
  return createRouter({
    history: createWebHistory(routerBase),
    scrollBehavior: () => ({ top: 0 }),
    routes: constantRouter
  })
}

export function resetRouter(): void {
  const next = build()
  ;(router as any).options.routes = next.options.routes
  // Vue Router 4: rebuild matcher by re-creating instance is tricky;
  // instead, remove all dynamically added routes by name.
  router.getRoutes().forEach((r) => {
    if (r.name && !constantRouter.find((c) => c.name === r.name)) {
      router.removeRoute(r.name)
    }
  })
}

export default router
