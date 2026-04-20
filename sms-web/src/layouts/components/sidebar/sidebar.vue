<template>
  <el-aside class="sidebar-container" :class="isCollapsed && 'collapsed'" :style="style">
    <el-scrollbar class="scrollbar-wrapper">
      <BaseMenu v-bind="menuProps" :collapse="isCollapsed" class="sidebar-menu" @select="selectItem" :page-configs="pageConfigs" :is-collapsed="isCollapsed"></BaseMenu>
    </el-scrollbar>
    <OperateBtn class="operate" @click="toggleCollapsed">
      <el-icon><ArrowDown /></el-icon>
    </OperateBtn>
  </el-aside>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores'
import BaseMenu from './baseMenu.vue'
import OperateBtn from './OperateBtn.vue'

interface PageConfig {
  menuBgColour?: string
  menuFontColour?: string
  menuFontSelectColour?: string
  menuSelectColour?: string
  [key: string]: unknown
}

interface Theme {
  [key: string]: unknown
}

interface MenuItemData {
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    theme?: Theme
    mode?: string
    menuData?: MenuItemData[]
    isLimitLevel?: boolean
    basePath?: string
    matchPath?: string
    selectItem?: (index: string) => void
  }>(),
  {
    mode: 'vertical',
    isLimitLevel: false,
    basePath: '/',
    matchPath: '',
    selectItem: () => () => {}
  }
)

const appStore = useAppStore()
const pageConfigs = computed<PageConfig>(() => appStore.pageConfig || {})
const isCollapsed = ref(false)
const menuProps = computed(() => {
  const { mode, menuData, isLimitLevel, basePath, matchPath } = props
  const { menuBgColour, menuFontColour, menuFontSelectColour } = pageConfigs.value
  return {
    mode,
    menuData,
    isLimitLevel,
    basePath,
    matchPath,
    backgroundColor: menuBgColour,
    textColor: menuFontColour,
    activeTextColor: menuFontSelectColour,
    uniqueOpened: true
  }
})
const style = computed(() => {
  return {
    backgroundColor: pageConfigs.value.menuBgColour,
    color: pageConfigs.value.menuFontColour
  }
})
provide(
  'backgroundActiveColor',
  computed(() => pageConfigs.value.menuSelectColour)
)
const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
<style lang="scss" scoped>
.sidebar-container {
  background: #fff;
  z-index: 3;
  width: 160px !important;
  transition: width 0.18s;
  border-top: 1px solid #ebebeb;
  border-right: 1px solid #ebebeb;
  overflow: hidden;
  height: 100%;
  &.collapsed {
    width: 64px !important;
    .operate {
      position: absolute;
      left: 42px;
      transform: rotate(90deg);
      transition: left 0.1s;
    }
    ::v-deep(.el-menu--collapse) {
      .el-sub-menu {
        overflow: hidden;
        & > .el-sub-menu__title {
          & > span {
            height: 0;
            width: 0;
            overflow: hidden;
            visibility: hidden;
            display: inline-block;
          }
          .el-sub-menu__icon-arrow {
            display: none;
          }
        }
      }
    }
  }
  .scrollbar-wrapper {
    height: 100%;
    ::v-deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
  }
  .sidebar-menu::-webkit-scrollbar {
    display: none;
  }
  .operate {
    position: absolute;
    left: 120px;
    top: 50%;
    font-size: 18px;
    cursor: pointer;
    color: #333;
    transform: rotate(-90deg);
    transition: left 0.1s;
  }
  @import './theme';
  ::v-deep(.el-sub-menu) .el-menu-item {
    padding: 0 30px !important;
    min-width: initial;
  }
  ::v-deep(.el-sub-menu__title) > .icon,
  ::v-deep(.el-menu-item) > .icon {
    margin-right: 6px;
  }
  ::v-deep(.el-menu-item.is-active) {
    background-color: #ecf5ff;
  }
}
</style>
