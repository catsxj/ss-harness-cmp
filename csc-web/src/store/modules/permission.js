/**
 * Created by HaijunZhang on 2018/11/12.
 */
import { resolvePath } from 'utils/resolvePath'
import router, { asyncRouterMap, resetRouter } from '@/router'
import { removeToken } from 'utils/auth'
import { menuKey, enablePermissionStorage } from '@/config'
import { getUserPermissions, getDocumentStatus } from 'services/system'
import menuData from '../menuData'

async function init() {
  // 管理端文档有个[租户开关]
  // 目前这个接口阻塞了[宁德项目]的页面渲染验收指标, 如果后续项目有[文档]需求可放开
  // const res = await getDocumentStatus()
  // if (res.success) {
  //   if (res.data) return
  //   menuData[0].children &&
  //     menuData[0].children.forEach((item, index) => {
  //       if (item.name === '帮助') {
  //         menuData[0].children.splice(index, 1)
  //       }
  //     })
  // }
}

function hasPermission(role, route) {
  if (route.role) {
    return route.role.includes(role)
  } else {
    return true
  }
}

// 处理数据
const arrToOb = data => {
  const cache = {}
  if (typeof data === 'string') {
    JSON.parse(data).forEach(item => {
      cache[item.key] = item.value
    })
    return cache
  }
  return {}
}
// 对异步路由数据进行处理生成路由表
const handleAsyncRouter = (routes, role, basePath = '/') => {
  const res = []
  routes.forEach(route => {
    const { name, component, redirect, id, icon, role: routeRole, router, category } = route
    const meta = arrToOb(route.meta)
    const params = arrToOb(route.params)
    if (hasPermission(role, route)) {
      const tmp = {
        id,
        path: resolvePath(basePath, route.path),
        component: asyncRouterMap[component],
        name: router,
        meta: {
          ...meta,
          title: name,
          icon,
          role: routeRole
        },
        params,
        redirect,
        hidden: category === 'view'
      }
      if (route.children) {
        tmp.children = handleAsyncRouter(route.children, role, tmp.path)
      }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  topMenuData: [],
  sideRoutes: null,
  projectManager: false
}
const mutations = {
  SET_TOPMENU: (state, routers) => {
    state.topMenuData = routers
  },
  SET_SIDEROUTES: (state, routers) => {
    state.sideRoutes = routers
  },
  SET_PROJECTMANAGER: (state, projectManager) => {
    state.projectManager = projectManager
  }
}
const actions = {
  // 确保进入页面前用户和权限数据已经返回
  InitApp({ dispatch }) {
    init()
    return Promise.all([dispatch('GenerateRoutes'), dispatch('GetUserInfo', '', { root: true }), dispatch('GetSystemConfigs', '', { root: true })])
  },
  GenerateRoutes({ commit, state: { sideRoutes }, rootGetters, rootState }) {
    return new Promise(resolve => {
      const callback = (permissions, role) => {
        const topMenu = [...handleAsyncRouter(menuData, role)]
        const sideMenu = [...handleAsyncRouter(permissions, role)]
        const asyncRouter = [
          ...topMenu,
          ...sideMenu,
          {
            path: '*',
            redirect: '/404',
            hidden: true
          }
        ]
        console.log(JSON.parse(JSON.stringify(asyncRouter)))
        commit('SET_TOPMENU', topMenu)
        commit('SET_SIDEROUTES', sideMenu)
        router.addRoutes(asyncRouter)
        resolve()
      }
      // 如果启用了本地缓存并且刷新界面进入，直接在缓存取数据
      if (enablePermissionStorage && !sideRoutes) {
        const menuData = JSON.parse(localStorage.getItem(menuKey))
        if (menuData) {
          // 判断下菜单数据是否存在
          callback(menuData)
          return
        }
      }
      getUserPermissions().then(data => {
        if (data.success) {
          const { permission, accountCategory, projectManager } = data.data
          if (enablePermissionStorage) {
            localStorage.setItem(menuKey, JSON.stringify(permission))
          }
          commit('SET_PROJECTMANAGER', projectManager)
          callback(permission || [], projectManager ? 'Project' : accountCategory)
        }
      })
    })
  },
  // 动态更新权限
  ChangeRoutes({ dispatch }) {
    return new Promise(resolve => {
      resetRouter()
      dispatch('GenerateRoutes').then(accessRoutes => {
        resolve()
      })
    })
  },
  ResetRoutes({ commit }, redirectToLogin = true) {
    return new Promise(resolve => {
      resetRouter()
      commit('SET_SIDEROUTES', null)
      if (enablePermissionStorage) {
        localStorage.removeItem(menuKey)
      }
      removeToken()
      if (redirectToLogin) router.replace('/login')
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
