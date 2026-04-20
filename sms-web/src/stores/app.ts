import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userKey, enableUserStorage } from '@/config'
import { getSystemConfigs, getUserInfo } from 'services/system'
import { getLanguage } from '@/lang/index'
import { setBrowser } from './utils'

interface UserData {
  username?: string
  portrait?: string
  accountCategory?: string
  [key: string]: unknown
}

interface PageConfig {
  browserIcon?: string
  browserTitle?: string
  [key: string]: unknown
}

interface SystemConfig {
  projectConfigLabel?: string
  serviceConfigLabel?: string
  [key: string]: unknown
}

interface Theme {
  name: string
  sidebarColor: string
}

interface SideMenuItem {
  [key: string]: unknown
}

const initialSystemConfig = (): SystemConfig => {
  try {
    return JSON.parse(localStorage.getItem('systemConfig') || '{}')
  } catch {
    return {}
  }
}

export const useAppStore = defineStore('app', () => {
  const isCollapsed = ref(false)
  const layout = ref<string>(localStorage.getItem('layout') || 'sidemenu')
  const sideMenuData = ref<SideMenuItem[]>([])
  const theme = ref<Theme>({ name: 'default', sidebarColor: '' })
  const pageConfig = ref<PageConfig>({})
  const systemConfig = ref<SystemConfig>(initialSystemConfig())
  const userData = ref<UserData | null>(null)
  const desktopUrl = ref<string | null>(null)
  const operateTime = ref<number | ''>('')
  const basePath = ref('')
  const $webSocket = ref<unknown>('')
  const appPath = ref('')
  const expire = ref(false)
  const language = ref<string>(getLanguage())

  function setExpire(value: boolean) {
    expire.value = value
  }
  function setOperateTime() {
    operateTime.value = new Date().getTime()
  }
  function setLayout(_value: string) {
    // 保留接口但不持久化（与 Vuex 旧行为一致：原 mutation 已注释）
  }
  function setWebSocket(value: unknown) {
    $webSocket.value = value
  }
  function setUserData(data: UserData = {}) {
    userData.value = data
  }
  function setDesktopUrl(value: string | null) {
    desktopUrl.value = value
  }
  function resetUser() {
    userData.value = {}
    if (enableUserStorage) {
      localStorage.removeItem(userKey)
    }
  }
  function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value
  }
  function settingSideMenu(data: SideMenuItem[]) {
    sideMenuData.value = data
  }
  function settingBasePath(data: string) {
    basePath.value = data
  }
  function settingPageConfig(data: PageConfig) {
    const { browserIcon, browserTitle } = data
    if (browserIcon && browserTitle) setBrowser(browserIcon, browserTitle)
    pageConfig.value = data
  }
  function settingSystemConfig(data: SystemConfig) {
    data.projectConfigLabel = data.projectConfigLabel || '项目'
    data.serviceConfigLabel = data.serviceConfigLabel || '业务'
    localStorage.setItem('systemConfig', JSON.stringify(data))
    systemConfig.value = data
  }
  function settingTheme(data: Theme) {
    theme.value = data
  }
  function setLanguage(value: string) {
    language.value = value
    localStorage.setItem('language', value)
  }
  function setAppPath(value: string) {
    appPath.value = value
  }

  async function getUserInfoAction() {
    if (enableUserStorage && !userData.value) {
      const cached = localStorage.getItem(userKey)
      if (cached) {
        setUserData(JSON.parse(cached))
        return
      }
    }
    const data = await getUserInfo()
    if (data.success) {
      const { portrait, ...others } = data.data.Manager || {}
      const result: UserData = {
        ...others,
        portrait: portrait || '/web-common-resource/img/avatar_default.png',
        accountCategory: data.data.accountCategory
      }
      if (enableUserStorage) {
        localStorage.setItem(userKey, JSON.stringify(result))
      }
      setUserData(result)
    }
  }

  async function getPageConfigs() {
    const data = await getSystemConfigs({ category: '界面配置' })
    if (data.success) settingPageConfig(data.data)
  }

  async function getSystemConfigsAction() {
    const data = await getSystemConfigs({
      codes: 'pwdStrength,lockScreenTime,serviceConfigLabel,projectConfigLabel'
    })
    if (data.success) settingSystemConfig(data.data)
  }

  return {
    isCollapsed,
    layout,
    sideMenuData,
    theme,
    pageConfig,
    systemConfig,
    userData,
    desktopUrl,
    operateTime,
    basePath,
    $webSocket,
    appPath,
    expire,
    language,
    setExpire,
    setOperateTime,
    setLayout,
    setWebSocket,
    setUserData,
    setDesktopUrl,
    resetUser,
    toggleSidebar,
    settingSideMenu,
    settingBasePath,
    settingPageConfig,
    settingSystemConfig,
    settingTheme,
    setLanguage,
    setAppPath,
    getUserInfo: getUserInfoAction,
    getPageConfigs,
    getSystemConfigs: getSystemConfigsAction
  }
})
