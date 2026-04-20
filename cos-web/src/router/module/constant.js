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
    redirect: '/process_order',
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
    name: 'CosDocuments',
    path: '/personal/documents',
    meta: {
      title: '帮助文档'
    },
    component: () => import('views/cosa/document/help.vue')
  },
  {
    name: 'ProfileApplyTplPreview',
    path: '/personal/process_order',
    meta: {
      title: '流程工单'
    },
    component: () => import('views/personal/apply/index.vue')
  },
  {
    name: 'ServiceWorkOrder',
    path: '/personal/service_work_order',
    meta: {
      title: '问题工单'
    },
    component: () => import('views/service_operate/flow/workorder/index.vue')
  },
  {
    name: 'ProfileMessage',
    path: '/personal/message',
    meta: {
      title: '我的消息'
    },
    component: () => import('views/personal/message/list.vue')
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
