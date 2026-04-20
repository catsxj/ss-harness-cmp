import { createRouter, createWebHistory } from 'vue-router'
import routes from './constant'

function createRoute() {
  return createRouter({
    history: createWebHistory(),
    routes,
  })
}
const router = createRoute()
export const asyncRouterMap = {
  Home: () => import('@/layouts/home.vue'),
  App: () => import('@/layouts/app.vue'),
}
export function resetRouter() {
  // const newRouter = createRoute();
  // router.matcher = newRouter.matcher; // reset router
}

export default router
