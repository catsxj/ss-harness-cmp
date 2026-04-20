import Vue from 'vue'
import Router from 'vue-router'
import constantRouter from './module/constant'
import resourceMap from './module/resource'
import opsMap from './module/ops'
import systemMap from './module/system'
import serviceMap from './module/service'
import monitorMap from './module/monitor'

Vue.use(Router)

export const asyncRouterMap = {
  Home: () => import('@/layouts/home.vue'),
  App: () => import('@/layouts/app.vue'),
  ...resourceMap,
  ...opsMap,
  ...systemMap,
  ...monitorMap,
  ...serviceMap
}
const createRouter = () =>
  new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRouter
  })
const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
