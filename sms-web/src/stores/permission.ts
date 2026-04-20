import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { resolvePath } from 'utils/resolvePath'
import { removeToken } from 'utils/auth'
import { menuKey, enablePermissionStorage, baseUrl } from '@/config'
import { getUserPermissions } from 'services/system'
import { urlToList } from './utils'
import { useAppStore } from './app'
import { useTagsViewStore } from './tagsView'

const POWERED_BY_QIANKUN: boolean = (window as any).__POWERED_BY_QIANKUN__

interface RawPermissionRoute {
  path: string
  router: string
  component?: string
  redirect?: string
  icon?: string
  id?: string | number
  category?: string
  meta: string
  params: string
  name: string
  children?: RawPermissionRoute[]
}

interface AsyncRouteNode {
  id?: string | number
  path: string
  name: string
  redirect?: string
  hidden: boolean
  meta: Record<string, unknown>
  params: Record<string, unknown>
  children?: AsyncRouteNode[]
}

const getAppRoutes = (data: RawPermissionRoute[]): RawPermissionRoute[] => {
  for (const item of data) {
    if (item.path === baseUrl) return item.children || []
  }
  return []
}

const getParent = (path: string, routes: any[]): any => {
  for (const route of routes) {
    if (route.component && route.path === path) return route
    if (route.children) {
      const found = getParent(path, route.children)
      if (found) return found
    }
  }
  return undefined
}

export const usePermissionStore = defineStore('permission', () => {
  const addRoutes = ref<AsyncRouteNode[] | null>(null)
  const buttons = ref<string[]>([])
  const resultRoutes: any[] = []

  function setRoutes(routes: AsyncRouteNode[] | null) {
    addRoutes.value = routes
  }
  function setButtons() {
    try {
      buttons.value = JSON.parse(localStorage.getItem('buttonData') || '[]')
    } catch {
      buttons.value = []
    }
  }

  function createRoute(item: RouteRecordRaw & { path: string }, router: any) {
    const urlList = urlToList(item.path)
    const resultList = urlList.slice(0, urlList.length - 1).reverse()
    let parent: any
    for (const url of resultList) {
      parent = getParent(url, resultRoutes)
      if (parent) break
    }
    if (parent) {
      if (parent.children) parent.children.push(item)
      else parent.children = [item]
      router.addRoute(parent.name, item)
    } else {
      resultRoutes.push(item)
      if (POWERED_BY_QIANKUN) router.addRoute(item)
      else router.addRoute('Home', item)
    }
  }

  function handleAsyncRouter(
    routes: RawPermissionRoute[],
    asyncRouterMap: Record<string, any>,
    router: any,
    basePath = '/'
  ): AsyncRouteNode[] {
    const res: AsyncRouteNode[] = []
    routes.forEach((route) => {
      const { component, name, redirect, icon, id, category, meta, params } = route
      const metaCache: Record<string, unknown> = {}
      JSON.parse(meta).forEach((item: { key: string; value: unknown }) => {
        metaCache[item.key] = item.value
      })
      const paramsCache: Record<string, unknown> = {}
      JSON.parse(params).forEach((item: { key: string; value: unknown }) => {
        paramsCache[item.key] = item.value
      })
      const tmp: AsyncRouteNode = {
        id,
        path: resolvePath(basePath, route.path),
        name: route.router,
        redirect,
        hidden: category === 'view',
        meta: { ...metaCache, title: name, icon },
        params: paramsCache
      }
      if (component || redirect) {
        createRoute(
          {
            path: resolvePath(basePath, route.path),
            component: component ? asyncRouterMap[component] : undefined,
            name: route.router,
            redirect: redirect && resolvePath(basePath, redirect),
            meta: { ...metaCache, title: name, icon }
          } as any,
          router
        )
      }
      if (route.children) {
        tmp.children = handleAsyncRouter(route.children, asyncRouterMap, router, tmp.path)
      }
      res.push(tmp)
    })
    return res
  }

  async function generateRoutes(
    asyncRouterMap: Record<string, any>,
    router: any,
    permissions?: RawPermissionRoute[]
  ): Promise<AsyncRouteNode[]> {
    const appStore = useAppStore()
    const callback = (permission: RawPermissionRoute[]) => {
      resultRoutes.length = 0
      const asyncRouter = handleAsyncRouter(getAppRoutes(permission), asyncRouterMap, router)
      setRoutes(asyncRouter)
      appStore.settingSideMenu(asyncRouter)
      return asyncRouter
    }
    if (permissions) return callback(permissions)
    if (enablePermissionStorage && !addRoutes.value) {
      const cached = localStorage.getItem(menuKey)
      if (cached) return callback(JSON.parse(cached))
    }
    const data = await getUserPermissions()
    if (data.success) {
      if (enablePermissionStorage) localStorage.setItem(menuKey, JSON.stringify(data.data))
      return callback(data.data)
    }
    return []
  }

  async function changeRoutes(asyncRouterMap: Record<string, any>, router: any, resetRouter: () => void) {
    resetRouter()
    return generateRoutes(asyncRouterMap, router)
  }

  async function resetRoutes(
    router: any,
    resetRouterFn: () => void,
    redirectToLogin = true
  ): Promise<void> {
    const appStore = useAppStore()
    const tagsViewStore = useTagsViewStore()
    resetRouterFn()
    setRoutes(null)
    if (enablePermissionStorage) localStorage.removeItem(menuKey)
    appStore.resetUser()
    appStore.settingSideMenu([])
    await tagsViewStore.delAllViews()
    removeToken()
    if (POWERED_BY_QIANKUN) {
      location.href = '/login'
    } else if (redirectToLogin) {
      router.replace('/login')
    }
  }

  return {
    addRoutes,
    buttons,
    setRoutes,
    setButtons,
    generateRoutes,
    changeRoutes,
    resetRoutes
  }
})
