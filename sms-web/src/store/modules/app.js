/**
 * Created by Zhang Haijun on 2018/6/15.
 */
import { userKey, enableUserStorage } from '@/config'
import { getSystemConfigs, getUserInfo } from 'services/system'
import { getLanguage } from '@/lang/index'
import { setBrowser } from '../utils'

const state = {
  isCollapsed: false,
  layout: localStorage.getItem('layout') || 'sidemenu',
  sideMenuData: [],
  theme: {
    name: 'default',
    sidebarColor: ''
  },
  pageConfig: {},
  systemConfig: JSON.parse(localStorage.getItem('systemConfig')) || {},
  userData: null,
  desktopUrl: null,
  operateTime: '',
  basePath: '',
  $webSocket: '',
  appPath: '',
  expire: false,
  language: getLanguage()
}
const mutations = {
  SET_EXPIRE(state, value) {
    state.expire = value
  },
  SET_OPERATETIME(state) {
    state.operateTime = new Date().getTime()
  },
  SET_LAYOUT(state, value) {
    // state.layout = value;
    // localStorage.setItem('layout', value)
  },
  SET_WEBSOCKET(state, value) {
    state.$webSocket = value
  },
  SET_USERDATA(state, userData = {}) {
    state.userData = userData
  },
  SET_DESKTOPURL(state, value) {
    state.desktopUrl = value
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
  },
  SETTING_THEME(state, data) {
    state.theme = data
  },
  SET_LANGUAGE: (state, language) => {
    state.language = language
    localStorage.setItem('language', language)
  },
  SET_APP_PATH(state, value) {
    state.appPath = value
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
