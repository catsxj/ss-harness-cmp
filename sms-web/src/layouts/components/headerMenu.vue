<template>
  <ul class="header-menu">
    <!-- 头部菜单列表保留 DOM 壳，实际顶栏菜单已由基座处理 -->
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, usePermissionStore } from '@/stores'

interface PageConfig {
  headerSelectColour?: string
  headerFontSelectColour?: string
  [key: string]: unknown
}

interface MenuItem {
  id?: string | number
  path: string
  hidden?: boolean
  selected?: boolean
  children?: MenuItem[]
  meta?: { title?: string; icon?: string; [key: string]: unknown }
}

defineProps<{ pageConfigs: PageConfig }>()

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const firstPath = computed(() => `/${route.path.split('/')[1]}`)
const menuData = computed<MenuItem[]>(() =>
  ((permissionStore.addRoutes ?? []) as MenuItem[]).filter((item) => !item.hidden)
)
const hideHeadMenu = computed(() => menuData.value.filter((item) => !item.hidden).length === 1)

function getJumpRoute(data: MenuItem[]): string {
  const first = data[0]
  if (first.children && first.children.length) return getJumpRoute(first.children)
  return first.path
}

function resetMenu(flag?: number | boolean): void {
  menuData.value.forEach((row) => {
    row.selected = false
  })
  if (flag) {
    appStore.settingSideMenu([])
    appStore.settingBasePath('/')
  }
}

function selectMenu(item: MenuItem, flag?: number | boolean): void {
  if (item.selected) return
  resetMenu()
  const menu = menuData.value.find((cell) => cell.id === item.id)
  if (!menu) return
  menu.selected = true
  const menus = (menu.children ?? []).filter((child) => !child.hidden)
  if (menus.length) {
    appStore.settingSideMenu(menu.children ?? [])
    appStore.settingBasePath(menu.path)
  } else {
    resetMenu(true)
  }
  if (flag) {
    router.push({ path: getJumpRoute(menu.children ?? []) })
  }
}

function initMenu(_flag?: string): void {
  if (!menuData.value || menuData.value.length === 0) return
  const matched = menuData.value.find((item) => item.path === firstPath.value)
  if (matched) {
    selectMenu(matched, route.name === 'Home')
  } else {
    resetMenu(1)
  }
}

defineExpose({ firstPath, menuData, hideHeadMenu, selectMenu, resetMenu, initMenu })
</script>

<style lang="scss">
ul.header-menu {
  margin: 0;
  list-style: none;
  flex: 1;
  display: flex;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  li {
    display: flex;
    align-items: center;
    font-size: 14px;
    position: relative;
    height: 48px;
    cursor: pointer;
    white-space: nowrap;
    padding: 0 20px;
    float: left;
    .icon {
      font-size: 14px;
      margin-right: 4px;
    }
    &.selected {
      color: #fff;
      background: #15171d;
    }
    div {
      display: none;
      position: absolute;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
