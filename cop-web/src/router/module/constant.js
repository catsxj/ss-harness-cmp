/**
 * Created by HaijunZhang on 2018/11/12.
 */

const main = [
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
    path: '/',
    component: () => import('@/layouts/home.vue'),
    redirect: '/resource_dashboard',
    meta: {
      title: '主页',
      noTag: true
    },
    name: 'Home',
    children: [
      {
        name: 'Redirect',
        path: 'redirect',
        meta: { noTag: true },
        component: () => import('@/layouts/redirect.vue')
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    meta: {
      title: '404',
      noTag: true
    },
    component: () => import('@/views/errorPage/404.vue')
  },
  {
    path: '/401',
    meta: {
      title: '401',
      noTag: true
    },
    component: () => import('@/views/errorPage/401.vue')
  }
]
export default main
