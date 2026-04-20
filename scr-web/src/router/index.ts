import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from 'views/Home.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('views/login/login.vue')
  },
  {
    path: '/sso',
    component: () => import('views/login/sso.vue')
  },
  {
    path: '/',
    redirect: '/login',
    component: Home,
    children: [
      {
        path: '/screen/list',
        component: () => import('views/screen/index.vue')
      },
      {
        path: '/screen/dc',
        component: () => import('views/dc_screen/index.vue')
      },
      {
        path: '/screen/resource',
        component: () => import('views/resource_screen/index.vue')
      },
      {
        path: '/screen/order',
        component: () => import('views/order_screen/index.vue')
      },
      {
        path: '/screen/operation',
        component: () => import('views/operation_screen/index.vue')
      },
      {
        path: '/room/3d/:id',
        component: () => import('views/three_room/index.vue')
      },
      {
        path: '/screen/count',
        component: () => import('views/count_screen/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
