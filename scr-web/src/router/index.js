import Vue from 'vue'
import Home from 'views/Home.vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
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
    children: [{
      path: '/screen/list',
      component: () => import('views/screen/index.vue')
    }, {
      path: '/screen/dc',
      component: () => import('views/dc_screen/index.vue')
    },
    // {
    //   path: '/screen/room',
    //   component: () => import('views/room_screen/index.vue')
    // },
    {
      path: '/screen/resource',
      component: () => import('views/resource_screen/index.vue')
    }, {
      path: '/screen/order',
      component: () => import('views/order_screen/index.vue')
    }, {
      path: '/screen/operation',
      component: () => import('views/operation_screen/index.vue')
    },
    // {
    //   path: '/screen/business_network',
    //   component: () => import('views/business_network_screen/index.vue')
    // },
    {
      path: '/room/3d/:id',
      component: () => import('views/three_room/index.vue')
    },
    // {
    //   path: '/screen/outside',
    //   component: () => import('views/outside/index.vue')
    // }, {
    //   path: '/screen/dc_build',
    //   component: () => import('views/dc_screen_build/index.vue')
    // },
    {
      path: '/screen/count',
      component: () => import('views/count_screen/index.vue')
    }
    // {
    //   path: '/screen/network',
    //   component: () => import('views/network_screen/index.vue')
    // },
    // {
    //   path: '/screen/network_iframe',
    //   component: () => import('views/network_screen/topology.vue')
    // }
    ]
  }
]
const router = new VueRouter({
  mode: 'history',
  base: process.env.VUE_APP_BASEURL,
  routes
})

export default router
