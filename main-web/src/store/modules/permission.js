/**
 * Created by HaijunZhang on 2018/11/12.
 */
import { resolvePath } from 'utils/resolvePath'
import { removeToken } from 'utils/auth'
import { getUserPermissions } from 'services'
import BlankView from '@/layouts/blank.vue'
import router, { resetRouter } from '@/router'
import { menuKey, enablePermissionStorage } from '@/config'
import { urlToList } from '../utils'
import actionStore from '@/core/actions'

const resultRoutes = []
// 递归获取路由的父元素
const getParent = (path, routes) => {
  let res
  for (const route of routes) {
    const { path: ph, component } = route
    // 组件存在并且路径相同
    if (component && ph === path) {
      res = route
      break
    } else if (route.children) {
      res = getParent(path, route.children)
    }
  }
  return res
}
const createRoute = (item) => {
  const urlList = urlToList(item.path)
  // ['/system','/system/configs','/system/configs/page'] -> ['/system/configs', '/system']
  const resultList = urlList.slice(0, urlList.length - 1).reverse()
  let t = ''
  for (const url of resultList) {
    t = getParent(url, resultRoutes)
    if (t) break
  }
  if (t) {
    if (t.children) {
      t.children.push(item)
    } else {
      t.children = [item]
    }
    router.addRoute(t.name, item)
  } else {
    resultRoutes.push(item)
    router.addRoute('Home', item)
  }
}
// 对异步路由数据进行处理生成路由表
const handleAsyncRouter = (routes, basePath = '/') => {
  const res = []
  routes.forEach((route) => {
    const { router, component, name, redirect, icon, id, category, meta, params } = route
    // 生成meta对象
    const metaCache = {}
    JSON.parse(meta).forEach((item) => {
      metaCache[item.key] = item.value
    })
    // 生成params对象
    const paramsCache = {}
    JSON.parse(params).forEach((item) => {
      paramsCache[item.key] = item.value
    })
    const tmp = {
      id,
      path: resolvePath(basePath, route.path),
      name: router,
      component,
      redirect,
      hidden: category === 'view',
      meta: {
        ...metaCache,
        title: name,
        icon
      },
      params: paramsCache
    }
    if (component || redirect) {
      createRoute({
        path: resolvePath(basePath, route.path),
        component: !redirect && BlankView,
        name: router,
        redirect: redirect && resolvePath(basePath, redirect),
        meta: {
          ...metaCache,
          title: name,
          icon
        },
        params: paramsCache
      })
    }
    if (route.children) {
      tmp.children = handleAsyncRouter(route.children, tmp.path)
    }
    res.push(tmp)
  })
  return res
}
const state = {
  addRoutes: null,
  buttons: []
}
const mutations = {
  SET_ROUTES: (state, routers) => {
    state.addRoutes = routers
  },
  SET_BUTTONS: (state) => {
    state.buttons = JSON.parse(localStorage.getItem('buttonData'))
  }
}
const actions = {
  GenerateRoutes({ commit, state: { addRoutes } }) {
    return new Promise((resolve) => {
      const callback = (permissions) => {
        resultRoutes.length = 0
        actionStore.setGlobalState({
          permissions
        })
        const asyncRouter = handleAsyncRouter(permissions)
        commit('SET_ROUTES', asyncRouter)
        resolve(asyncRouter)
      }
      // 如果启用了本地缓存并且刷新界面进入，直接在缓存取数据,因为存在一种情况主动更新数据
      if (enablePermissionStorage && !addRoutes) {
        const menuData = JSON.parse(localStorage.getItem(menuKey))
        if (menuData) {
          // 判断下菜单数据是否存在
          callback(menuData)
          return
        }
      }
      getUserPermissions()
        .then((data) => {
          if (data.success) {
            if (enablePermissionStorage) {
              localStorage.setItem(menuKey, JSON.stringify(data.data))
            }
            callback(data.data)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    })
  },
  // 动态更新权限
  ChangeRoutes({ dispatch }) {
    return new Promise((resolve) => {
      resetRouter()
      dispatch('GenerateRoutes').then(() => {
        resolve()
      })
    })
  },
  ResetRoutes({ commit, dispatch }, redirectToLogin = true) {
    return new Promise((resolve) => {
      resetRouter()
      commit('SET_ROUTES', null)
      if (enablePermissionStorage) {
        localStorage.removeItem(menuKey)
      }
      // 重置用户信息
      commit('RESET_USER', null, { root: true })
      // 重置用户信息
      commit('SETTING_SIDE_MENU', [], { root: true })
      // 重置标签信息
      dispatch('tagsView/delAllViews', null, { root: true })
      removeToken()
      if (redirectToLogin) window.location.href = '/login'
      resolve()
    })
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
