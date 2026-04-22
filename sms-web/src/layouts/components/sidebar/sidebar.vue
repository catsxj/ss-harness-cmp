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
// 菜单视觉：未选白底，选中浅蓝底 + 蓝字
const menuProps = computed(() => {
  const { mode, menuData, isLimitLevel, basePath, matchPath } = props
  return {
    mode,
    menuData,
    isLimitLevel,
    basePath,
    matchPath,
    backgroundColor: '#ffffff',
    textColor: '#475569',
    activeTextColor: '#2563eb',
    uniqueOpened: true
  }
})
const style = computed(() => ({ backgroundColor: '#ffffff', color: '#475569' }))
provide('backgroundActiveColor', computed(() => '#eff6ff'))
const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
<style lang="scss" scoped>
.sidebar-container {
  background: #ffffff;
  z-index: 3;
  width: 180px !important;
  transition: width 0.18s;
  border-top: 1px solid #e4e7eb;
  border-right: 1px solid #e4e7eb;
  overflow: hidden;
  height: 100%;
  font-family: ui-sans-serif, 'SF Pro Text', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
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
  // ────────── Element Plus 菜单视觉重写 ──────────
  ::v-deep(.el-menu) {
    border-right: none;
    background: transparent;
  }

  // 菜单项 & 子菜单标题：默认白底，无 hover 变化
  ::v-deep(.el-menu-item),
  ::v-deep(.el-sub-menu__title) {
    height: 42px;
    line-height: 42px;
    margin: 2px 8px;
    padding: 0 14px !important;
    border-radius: 6px;
    color: #475569 !important;
    background: transparent !important;
    font-size: 13px;
    font-weight: 500;
    min-width: initial !important;

    .icon,
    .svg-icon-compat {
      margin-right: 10px;
      font-size: 16px;
      color: #94a3b8;
    }
  }

  // 嵌套子菜单项（二级、三级）缩进
  ::v-deep(.el-sub-menu) .el-menu-item {
    padding: 0 14px 0 36px !important;
  }
  ::v-deep(.el-sub-menu .el-sub-menu) .el-menu-item {
    padding: 0 14px 0 52px !important;
  }

  // 展开的子菜单背景淡化
  ::v-deep(.el-menu--inline) {
    background: #fafbfc;
    margin: 0 8px;
    border-radius: 6px;
  }

  // ────────── 选中态：浅蓝底 + 蓝字 ──────────
  ::v-deep(.el-menu-item.is-active) {
    background: #eff6ff !important;
    color: #2563eb !important;

    .icon,
    .svg-icon-compat {
      color: #2563eb !important;
    }
  }

  // 打开的子菜单标题：保持中性
  ::v-deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    color: #0f172a !important;
    background: transparent !important;

    .icon, .svg-icon-compat { color: #0f172a !important; }
  }

  ::v-deep(.el-sub-menu__icon-arrow) {
    right: 14px;
    color: #94a3b8;
    transition: transform 200ms cubic-bezier(0.32, 0, 0.16, 1);
  }
}
</style>
