/**
 * Created by HaijunZhang on 2018/11/12.
 */

const main = [
  {
    path: '/',
    redirect: '/dashboard',
    meta: {
      title: '主页'
    },
    component: () => import('@/layouts/home.vue'),
    children: [
      {
        name: 'Dashboard',
        path: '/dashboard',
        meta: {
          title: '欢迎！',
          hideBreadcrumb: true
        },
        component: () => import('views/dashboard/index.vue')
      },
      {
        path: '/message',
        name: 'MyMessage',
        meta: {
          title: '我的消息',
          icon: 'iconfont icon-gailan1'
        },
        component: () => import('views/message/list.vue')
      },
      {
        name: 'ServiceQuota',
        path: '/service_quota',
        meta: {
          title: '服务配额'
        },
        component: () => import('views/service_quota/index.vue')
      },
      {
        name: 'Redirect',
        path: 'redirect',
        component: () => import('@/layouts/redirect.vue')
      }
    ]
  },
  {
    name: 'Login',
    path: '/login',
    component: () => import('views/login/login.vue')
  },
  {
    path: '/sso/auth/call_back',
    component: () => import('views/login/sso.vue')
  },
  {
    name: 'LockMe',
    path: '/lockme',
    component: () => import('views/login/lockme.vue')
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401.vue')
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404.vue')
  }
]
export default main
