import Vue from 'vue'
import Router from 'vue-router'
import constantRouter from './module/constant'
import serviceMap from './module/service_operate'
import cosaMap from './module/cosa'

const originalReplace = Router.prototype.replace
Router.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch((err) => err)
}

Vue.use(Router)

export const asyncRouterMap = {
  Home: () => import('@/layouts/home.vue'),
  App: () => import('@/layouts/app.vue'),
  ...serviceMap,
  ...cosaMap
}
const createRouter = () =>
  new Router({
    base: process.env.VUE_APP_BASEURL,
    mode: 'history',
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRouter
  })
const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}
export default router
