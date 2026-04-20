/**
 * Created by Zhang Haijun on 2018/6/15.
 */
import { userKey, enableUserStorage } from '@/config'
import { getSystemConfigs, getUserInfo } from 'services/system'
import { setBrowser } from '../utils'
const app = {
  state: {
    isCollapsed: false,
    menuData: [],
    sideMenuData: [],
    layout: localStorage.getItem('csc_layout') || 'sidemenu',
    theme: {
      name: 'default',
      sidebarColor: ''
    },
    logo: '',
    shortLogo: '',
    userData: null,
    operateTime: '',
    updateProject: {},
    $webSocket: '',
    projectId: '',
    pageConfig: {},
    systemConfig: {},
    ProfileMessageId: '',
    openFlow: false,
    isInstallSoftware: false, // 是否开启安装软件
    paymentMode: ['Hour', 'Month'] // 默认全选
  },
  mutations: {
    // SET_LAYOUT (state, value) {
    //   state.layout = value;
    //   localStorage.setItem('csc_layout', value);
    // },
    SET_OPENFLOW(state, value) {
      state.openFlow = value
    },
    SET_ISINSTALLSOFTWARE(state, value) {
      state.isInstallSoftware = value
    },
    SET_PAYMENTMODE(state, value) {
      state.paymentMode = value
    },
    SET_WEBSOCKET(state, value) {
      state.$webSocket = value
    },
    SET_UPDATEPROJECT(state, fun) {
      state.updateProject = fun
    },
    SET_OPERATETIME(state) {
      state.operateTime = new Date().getTime()
    },
    SET_USERDATA(state, userData = {}) {
      state.userData = userData
    },
    RESET_USER(state) {
      state.userData = {}
      if (enableUserStorage) {
        localStorage.removeItem(userKey)
      }
    },
    // TOGGLE_SIDEBAR (state) {
    //   state.isCollapsed = !state.isCollapsed;
    // },
    SETTING_LOGO(state, data) {
      state.logo = data
    },
    SETTING_SHORT_LOGO(state, data) {
      state.shortLogo = data
    },
    SETTING_THEME(state, data) {
      state.theme = data
    },
    SETTING_PWD_RULE(state, data) {
      state.pwdRule = data
    },
    SETTING_PAGE_CONFIG(state, data) {
      const { browserIconCsc, browserTitleCsc } = data
      setBrowser(browserIconCsc, browserTitleCsc)
      state.pageConfig = data
    },
    SETTING_SYSTEM_CONFIG(state, data) {
      state.systemConfig = data
    },
    SET_PROFILEMESSAGEId: (state, data) => {
      state.ProfileMessageId = data
    }
  },
  actions: {
    GetUserInfo({ commit, state: { userData } }) {
      return new Promise(resolve => {
        // 如果启用了本地缓存，直接在缓存取数据, 如果userData存在强制调用接口刷新
        if (enableUserStorage && !userData) {
          const userData = JSON.parse(localStorage.getItem(userKey))
          if (userData) {
            // 判断下菜单数据是否存在
            commit('SET_USERDATA', userData)
            resolve()
            return
          }
        }
        getUserInfo().then(data => {
          if (data.success) {
            const { accountCategory, Tenant = {}, tenantAccount = {}, User = {}, portrait, projectId } = data.data
            const result = {
              accountCategory,
              projectId,
              ...Tenant,
              tenantAccount,
              ...User
            }
            result.portrait = result.portrait || '/web-common-resource/img/avatar_default.png'
            if (enableUserStorage) {
              localStorage.getItem(userKey, JSON.stringify(result))
            }
            commit('SET_USERDATA', result)
            resolve(result)
          }
        })
      })
    },
    async GetPageConfigs({ commit }) {
      const data = await getSystemConfigs({ category: '自服务界面配置' })
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
}
export default app
