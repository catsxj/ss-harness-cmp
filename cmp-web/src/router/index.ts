import { createRouter, createWebHistory, type Router } from 'vue-router'
import constantRouter from './modules/constant'
import monitorMap from './modules/monitor'
import { baseUrl } from '@/config'

export const asyncRouterMap: Record<string, () => Promise<unknown>> = {
  Home: () => import('@/layouts/home.vue'),
  App: () => import('@/layouts/app.vue'),
  ...monitorMap
}

// Qiankun 下用 baseUrl (/cmp-web) 作 router base 匹配 activeRule
// 独立运行时保留 /cmp-web 前缀保持路径一致
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
  router.getRoutes().forEach((r) => {
    if (r.name && !constantRouter.find((c) => c.name === r.name)) {
      router.removeRoute(r.name)
    }
  })
}

export default router
