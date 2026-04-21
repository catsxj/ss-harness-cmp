import { createRouter, createWebHistory, type Router } from 'vue-router'
import constantRouter from './modules/constant'
import systemMap from './modules/system'

export const asyncRouterMap: Record<string, () => Promise<unknown>> = {
  Home: () => import('@/layouts/home.vue'),
  App: () => import('@/layouts/app.vue'),
  ...systemMap
}

const router: Router = build()

function build(): Router {
  return createRouter({
    history: createWebHistory(process.env.VUE_APP_BASEURL || '/'),
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
