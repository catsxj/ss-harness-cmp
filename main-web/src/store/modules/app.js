/**
 * Created by Zhang Haijun on 2018/6/15.
 */
import { getSystemConfigs, getUserInfo } from 'services'
import { userKey, enableUserStorage } from '@/config'
import { setBrowser } from '../utils'
import actionStore from '@/core/actions'

const state = {
  isCollapsed: false,
  sideMenuData: [],
  pageConfig: {},
  systemConfig: JSON.parse(localStorage.getItem('systemConfig')) || {},
  userData: null,
  operateTime: '',
  basePath: '',
  $webSocket: {},
  expire: false,
  appLoading: false
}
const mutations = {
  SET_EXPIRE(state, value) {
    state.expire = value
  },
  SET_APP_LOADING(state, value) {
    state.appLoading = value
  },
  SET_OPERATETIME(state) {
    state.operateTime = new Date().getTime()
  },
  SET_WEBSOCKET(state, value) {
    state.$webSocket = value
  },
  SET_ONMESSAGE(state, value) {
    if (state.$webSocket) {
      state.$webSocket.onmessage = value
    }
  },
  SET_USERDATA(state, userData = {}) {
    state.userData = userData
    actionStore.setGlobalState({
      userData
    })
  },
  RESET_USER(state) {
    state.userData = {}
    if (enableUserStorage) {
      localStorage.removeItem(userKey)
    }
  },
  TOGGLE_SIDEBAR(state) {
    state.isCollapsed = !state.isCollapsed
  },
  SET_COLLAPSED(state, value) {
    state.isCollapsed = value
  },
  SETTING_SIDE_MENU(state, data) {
    state.sideMenuData = data
  },
  SETTING_BASE_PATH(state, data) {
    state.basePath = data
  },
  SETTING_PAGE_CONFIG(state, data) {
    const { browserIcon, browserTitle } = data
    setBrowser(browserIcon, browserTitle)
    state.pageConfig = data
  },
  SETTING_SYSTEM_CONFIG(state, data) {
    // 为什么不用 csc 的方式 管理端父传子是异步方式 可能导致表格列渲染完成后接口还没返回
    data.projectConfigLabel = data.projectConfigLabel || '项目'
    data.serviceConfigLabel = data.serviceConfigLabel || '业务'
    localStorage.setItem('systemConfig', JSON.stringify(data))
    state.systemConfig = data
  }
}
const actions = {
  async GetUserInfo({ commit, state: { userData } }) {
    // 如果启用了本地缓存，直接在缓存取数据
    if (enableUserStorage && !userData) {
      const userData = JSON.parse(localStorage.getItem(userKey))
      if (userData) {
        // 判断下菜单数据是否存在
        commit('SET_USERDATA', userData)
        return
      }
    }
    const data = await getUserInfo()
    if (data.success) {
      // 云桌面登录与系统登录返回值不同
      const { portrait, ...others } = data.data.Manager || {}
      const result = {
        ...others,
        portrait: portrait || '/web-common-resource/img/avatar_default.png',
        accountCategory: data.data.accountCategory
      }
      if (enableUserStorage) {
        localStorage.setItem(userKey, JSON.stringify(result))
      }
      commit('SET_USERDATA', result)
    }
  },
  async GetPageConfigs({ commit }) {
    const data = await getSystemConfigs({ category: '界面配置' })
    if (data.success) {
      commit('SETTING_PAGE_CONFIG', data.data)
    }
  },
  async GetSystemConfigs({ commit }) {
    const data = await getSystemConfigs({ codes: 'pwdStrength,lockScreenTime,serviceConfigLabel,projectConfigLabel' })
    if (data.success) {
      commit('SETTING_SYSTEM_CONFIG', data.data)
    }
  }
}
export default {
  state,
  mutations,
  actions
}
