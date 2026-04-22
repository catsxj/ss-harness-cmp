import Vue from 'vue'
import Router from 'vue-router'
import constantRouter from './module/constant'
import opsMap from './module/ops'
import resourceMap from './module/resource'

const originalReplace = Router.prototype.replace;
Router.prototype.replace = function replace (location) {
  return originalReplace.call(this, location).catch(err => err);
}

Vue.use(Router)

export const asyncRouterMap = {
  Home: () => import('@/layouts/home.vue'),
  App: () => import('@/layouts/app.vue'),
  ...opsMap,
  ...resourceMap
}
const createRouter = () => new Router({
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
