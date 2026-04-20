<template>
  <div class="menu-wrapper" v-if="!menuItem.hidden">
    <template v-if="menuItem.children">
      <MenuItem v-if="hasOneChild(menuItem.children, menuItem)" :path="singleChild.path" :meta="singleChild.meta" :default-icon="defaultIcon"> </MenuItem>
      <el-sub-menu v-else :index="currPath">
        <template #title>
          <svg-icon :icon-name="menuItem.meta.icon || defaultIcon"></svg-icon>
          <span>{{ menuItem.meta.title }}</span>
        </template>
        <template v-for="child in menuItem.children" :key="child.path">
          <sidebar-item class="nest-menu" v-if="!child.hidden && !isLimitLevel && child.children" :menuItem="child" :base-path="currPath" :default-icon="defaultIcon"></sidebar-item>
          <MenuItem v-else-if="!child.hidden" :path="resolvePathFn(currPath, child.path)" :meta="child.meta" :default-icon="defaultIcon"> </MenuItem>
        </template>
      </el-sub-menu>
    </template>
    <MenuItem v-else :path="currPath" :meta="menuItem.meta"> </MenuItem>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { resolvePath } from 'utils/resolvePath'
import MenuItem from './MenuItem.vue'

interface MenuRoute {
  path: string
  hidden?: boolean
  meta: {
    icon?: string
    title?: string
    alwaysShow?: boolean
    [key: string]: unknown
  }
  children?: MenuRoute[]
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    menuItem: MenuRoute
    basePath?: string
    isLimitLevel?: boolean
    defaultIcon?: string
  }>(),
  {
    basePath: '',
    isLimitLevel: false,
    defaultIcon: ''
  }
)

const singleChild = ref<MenuRoute>({ path: '', meta: {} })

const currPath = computed(() => resolvePath(props.basePath, props.menuItem.path))

const resolvePathFn = (basePath: string, routePath: string) => resolvePath(basePath, routePath)

const hasOneChild = (children: MenuRoute[], parent: MenuRoute) => {
  if (children.length === 1 && !parent.meta.alwaysShow) {
    singleChild.value = children[0]
    return true
  }
  return false
}
</script>

<style></style>
