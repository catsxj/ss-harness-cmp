/**
 * Created by HaijunZhang on 2018/11/12.
 */
import store from './store'
import router from './router'
import { getToken, setToken } from 'utils/auth'
import { getQuery } from 'utils'
import { isEmpty, assign } from 'lodash-es'

const { token } = getQuery(location.hash)
if (token) {
  setToken(token)
}

const whiteList = ['/login', '/404', '/401', '/license', '/sso']
router.beforeEach(async (to, from, next) => {
  if (isEmpty(history.state.current)) {
    assign(history.state, { current: from.fullPath })
  }
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
