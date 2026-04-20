/**
 * Created by HaijunZhang on 2018/11/12.
 */
import store from './store'
import router from './router'
import { getToken, setToken, removeToken } from 'utils/auth'
import { getQuery } from 'utils'

const { token } = getQuery(location.hash)
if (token) {
  setToken(token)
}

export default function () {
  const whiteList = ['/login', '/404', '/401', '/license', '/sso']
  router.beforeEach(async (to, from, next) => {
    if (getToken()) {
      // 判断用户是否处于登录状态
      if (to.path === '/login') {
        // 如果已经登录重定向到主页
        await store.dispatch('permission/ResetRoutes', false)
        next('/login')
      } else {
        // 为null的场景： 刷新页面或者新开窗口；
        const addRoutes = store.getters.addRoutes
        if (addRoutes) {
          next()
        } else {
          try {
            await store.dispatch('permission/GenerateRoutes')
            store.dispatch('GetUserInfo')
            next({ ...to, replace: true })
          } catch (error) {
            // remove token and go to login page to re-login
            await store.dispatch('permission/ResetRoutes', false)
            next('/login')
          }
        }
      }
    } else {
      // 用户没有登录
      if (whiteList.includes(to.path)) {
        // 在白名单里直接跳转
        next()
      } else {
        next('/login')
      }
    }
  })
}
