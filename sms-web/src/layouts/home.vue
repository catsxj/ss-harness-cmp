<template>
  <el-container
    class="app-wrapper"
    :class="[{ hideSidebar: isCollapsed }, { 'font-big': isFontBig }, { 'expire-top': expire }]"
  >
    <SystemTip />
    <Header :match-path="matchPath" :is-top="isTop" @selectItem="selectItem" />
    <TagsView />
    <el-container style="overflow: hidden">
      <Sidebar
        v-if="menuData.length"
        :theme="theme"
        :is-collapsed="isCollapsed"
        :menu-data="menuData"
        :is-limit-level="true"
        :match-path="matchPath"
        :base-path="basePath"
        :select-item="selectItem"
      />
      <el-container class="main-container">
        <el-main class="main-body">
          <el-scrollbar class="custom-scrollbar" style="flex: 1">
            <transition enter-active-class="fadeInUp" mode="out-in">
              <AppShell />
            </transition>
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { trimStart, cloneDeep } from 'lodash-es'
import Sidebar from './components/sidebar/sidebar.vue'
import Header from './components/Header.vue'
import TagsView from './components/TagsView/index.vue'
import SystemTip from './components/SystemTip.vue'
import AppShell from './app.vue'
import { useAppStore, usePermissionStore } from '@/stores'

interface MenuNode {
  path: string
  hidden?: boolean
  children?: MenuNode[]
  [key: string]: unknown
}

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const theme = computed(() => appStore.theme)
const isCollapsed = computed(() => appStore.isCollapsed)
const menuData = computed(() => appStore.sideMenuData as MenuNode[])
const basePath = computed(() => appStore.basePath)
const layout = computed(() => appStore.layout)
const expire = computed(() => appStore.expire)
const isFontBig = computed(() => (appStore.pageConfig as { contentFontSize?: string }).contentFontSize === 'big')
const addRoutes = computed(() => (permissionStore.addRoutes ?? []) as MenuNode[])
const isTop = computed(() => layout.value === 'topmenu')

const thirdMenuData = ref<Record<string, unknown>>({})
const matchPath = ref<string>('')
const desktopLayout = ref<boolean>(false)

function getLevelPath(level: number): string {
  return `/${trimStart(route.path, '/').split('/', level).join('/')}`
}

function getThirdMenu(data: MenuNode[], target: string): void {
  for (const items of data) {
    if (target.includes(items.path) && items.children) {
      if (target === items.path) {
        const cloned = cloneDeep(items)
        const children: MenuNode[] = []
        const list = items.children || []
        list.forEach((item) => {
          if (!item.hidden) children.push(item)
        })
        thirdMenuData.value = Object.assign(cloned, { children: children.length ? children : null })
      } else {
        getThirdMenu(items.children, target)
      }
      break
    }
  }
}

function handlePath(): void {
  matchPath.value = getLevelPath(3)
  setTimeout(() => {
    const pathLen = route.path.split('/').length
    thirdMenuData.value = {}
    if (pathLen >= 6) {
      getThirdMenu(addRoutes.value, getLevelPath(4))
    } else if (pathLen >= 5) {
      getThirdMenu(addRoutes.value, matchPath.value)
    }
  })
}

function selectItem(_path: string): void {
  // 保留接口，原逻辑注释，不做二次点击跳转处理
}

watch(
  () => route.path,
  () => {
    handlePath()
  }
)

handlePath()
permissionStore.setButtons()
appStore.getSystemConfigs()

onMounted(() => {
  desktopLayout.value = Boolean((window.parent as unknown as { DESKTOP_LAYOUT?: boolean }).DESKTOP_LAYOUT)
})

defineExpose({ selectItem, thirdMenuData, desktopLayout })
</script>

<style lang="scss" scoped>
.app-wrapper {
  background: #e7f4ff;
  flex-direction: column;
}

.main-container {
  position: relative;
  height: 100%;
  background: #f5f7f9;
  .main-body {
    padding: 0 8px 8px 10px;
    display: flex;
    flex-direction: column;
  }
}

.hideSidebar {
  .sidebar {
    width: 64px !important;
  }
}
</style>
