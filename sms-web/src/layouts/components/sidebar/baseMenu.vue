<template>
  <el-menu :default-active="matchPath" :mode="mode" @select="selectItem" v-bind="$attrs">
    <sidebar-item v-for="route in sideMenuData" :menuItem="route" :key="route.path" :isLimitLevel="isLimitLevel" :base-path="basePath" :default-icon="defaultIcon"></sidebar-item>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import sidebarItem from './sidebarItem.vue'

interface MenuRoute {
  path: string
  hidden?: boolean
  children?: MenuRoute[]
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    mode?: string
    menuData?: MenuRoute[]
    isLimitLevel?: boolean
    limitLevel?: number
    basePath?: string
    matchPath?: string
    defaultIcon?: string
  }>(),
  {
    mode: 'vertical',
    menuData: () => [],
    isLimitLevel: false,
    limitLevel: 4,
    basePath: '/',
    matchPath: '',
    defaultIcon: 'svg-dot'
  }
)

const emit = defineEmits<{
  select: [index: string]
}>()

// 对菜单数据做过滤，去掉隐藏菜单
const filterMenuData = (data: MenuRoute[]): MenuRoute[] | null => {
  const menu: MenuRoute[] = []
  data.forEach((item) => {
    if (!item.hidden) {
      const cache: MenuRoute = { ...item }
      menu.push(cache)
      if (item.children && item.path.split('/').length < props.limitLevel + 1) {
        cache.children = filterMenuData(item.children) || undefined
      } else {
        cache.children = undefined
      }
    }
  })
  return menu.length ? menu : null
}

const sideMenuData = computed(() => filterMenuData(props.menuData) || [])

const selectItem = (index: string) => {
  emit('select', index)
}
</script>
