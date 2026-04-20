/**
 * Created by HaijunZhang on 2018/11/12.
 */
import { Message } from 'element-ui'
import store from './store'
import router from './router'
import { getToken, setToken } from 'utils/auth'
import { getQuery } from 'utils'

const { token } = getQuery(location.hash)
if (token) {
  setToken(token)
}

const whiteList = ['/login', '/404', '/401', '/sso/auth/call_back']
router.beforeEach(async (to, from, next) => {
  if (getToken()) {
    // 判断用户是否处于登录状态
    if (to.path === '/login') {
      await store.dispatch('permission/ResetRoutes', false)
      next()
    } else {
      // 为null的场景： 刷新页面或者新开窗口；
      const sideRoutes = store.getters.sideRoutes
      if (sideRoutes) {
        if (to.path.includes('/resource_order') && !store.getters.projectId) {
          next()
        } else {
          next()
        }
      } else {
        try {
          await store.dispatch('permission/InitApp')
          next({ ...to, replace: true })
        } catch (error) {
          await store.dispatch('permission/ResetRoutes', false)
          next('/login')
        }
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})
