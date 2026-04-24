import type { Router } from 'vue-router'
import { getToken, setToken } from 'utils/auth'
import { getQuery } from 'utils'
import { usePermissionStore } from '@/stores/permission'
import { useAppStore } from '@/stores/app'
import { asyncRouterMap, resetRouter } from '@/router'

const { token } = getQuery(location.hash)
if (token) setToken(token)

export default function setupPermissionGuard(router: Router): void {
  const whiteList = ['/login', '/404', '/401', '/license', '/sso']
  router.beforeEach(async (to, _from, next) => {
    const permissionStore = usePermissionStore()
    const appStore = useAppStore()
    if (getToken()) {
      if (to.path === '/login') {
        await permissionStore.resetRoutes(router, resetRouter, false)
        next('/login')
      } else if (permissionStore.addRoutes) {
        next()
      } else {
        try {
          await permissionStore.generateRoutes(asyncRouterMap, router)
          appStore.getUserInfo()
          next({ ...to, replace: true })
        } catch {
          await permissionStore.resetRoutes(router, resetRouter, false)
          next('/login')
        }
      }
    } else if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  })
}
