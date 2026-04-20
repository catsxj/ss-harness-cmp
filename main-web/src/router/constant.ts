import type { RouteRecordRaw } from 'vue-router'
import BlankView from '@/layouts/blank.vue'

const routes: RouteRecordRaw[] = [
  {
    name: 'Login',
    path: '/login',
    component: () => import('views/login/login.vue')
  },
  {
    path: '/sso',
    component: () => import('views/login/sso.vue')
  },
  {
    name: 'LockMe',
    path: '/lockme',
    component: () => import('views/login/lockme.vue')
  },
  {
    name: 'Redirect',
    path: '/redirect',
    meta: { noTag: true },
    component: () => import('@/layouts/redirect.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/home.vue'),
    redirect: '/sms-web/resource_dashboard',
    meta: {
      title: '主页'
    },
    name: 'Home',
    children: [
      {
        path: '/sms-web/resource_dashboard',
        meta: {
          noTag: true,
          hiddenSide: true
        },
        component: BlankView
      },
      {
        path: '/sms-web/redirect',
        meta: {
          noTag: true,
          hiddenSide: true
        },
        component: BlankView
      },
      {
        path: '/personal/message',
        meta: {
          title: '我的消息'
        },
        component: BlankView
      },
      {
        path: '/personal/documents',
        meta: {
          title: '帮助中心'
        },
        component: BlankView
      },
      {
        path: '/personal/process_order',
        meta: {
          title: '流程工单'
        },
        component: BlankView
      },
      {
        path: '/personal/service_work_order',
        meta: {
          title: '问题工单'
        },
        component: BlankView
      }
    ]
  },
  {
    path: '/license',
    name: 'License',
    component: () => import('@/views/about/index.vue')
  }
]
export default routes
