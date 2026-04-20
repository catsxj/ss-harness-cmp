<template>
  <a-layout-sider :theme="theme" breakpoint="xl" @breakpoint="onBreakpoint" class="sidebar-container" width="190" :collapsed="isCollapsed" :class="isCollapsed && 'collapsed'">
    <el-scrollbar class="scrollbar-wrapper">
      <BaseMenu v-bind="menuProps" class="sidebar-menu" @select="selectItem" :page-configs="pageConfigs"></BaseMenu>
    </el-scrollbar>
    <OperateBtn class="operate" @click="$emit('toggleCollapsed')"> </OperateBtn>
  </a-layout-sider>
</template>

<script>
import { computed, provide } from 'vue'
import BaseMenu from './BaseMenu.vue'
import OperateBtn from './OperateBtn.vue'
import { useStore } from 'vuex'
import useGlobalStyle from './useGlobalStyle'

export default {
  components: { BaseMenu, OperateBtn },
  props: {
    theme: {
      type: String,
      default: 'light'
    },
    mode: {
      type: String,
      default: 'inline'
    },
    isCollapsed: {
      type: Boolean,
      default: false
    },
    menuData: {
      type: Array
    },
    isLimitLevel: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: '/'
    },
    matchPath: {
      type: String,
      default: ''
    },
    selectItem: {
      type: Function
    }
  },
  setup(props, context) {
    const store = useStore()
    const pageConfigs = computed(() => store.getters.pageConfig)
    const menuProps = computed(() => {
      const { mode, menuData, isLimitLevel, basePath, matchPath, isCollapsed } = props
      return {
        mode,
        menuData,
        isLimitLevel,
        basePath,
        matchPath,
        isCollapsed,
        mainMenu: true
      }
    })
    const { style } = useGlobalStyle()
    provide('styleConfigs', style)
    function onBreakpoint(broken) {
      context.emit('toggleCollapsed', broken)
    }
    return {
      onBreakpoint,
      menuProps,
      pageConfigs
    }
  }
}
</script>
<style lang="scss" scoped>
.sidebar-container {
  background: var(--czhj-color-background);
  color: var(--czhj-color-text);
  z-index: 3;
  transition: width 0.18s;
  overflow: hidden;
  height: 100%;
  &.collapsed {
    width: 50px !important;
    flex: auto !important;
    min-width: 50px !important;
    max-width: 50px !important;
    overflow: initial;
    .operate {
      position: absolute;
      left: 27px;
      transform: rotate(90deg);
      transition: left 0.1s;
      z-index: -1;
      &:hover {
        left: 30px;
      }
    }
  }
  .scrollbar-wrapper {
    height: 100%;
    ::v-deep(.el-scrollbar__view) {
      height: 100%;
    }
    ::v-deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
  }
  .operate {
    position: absolute;
    left: 155px;
    top: 50%;
    font-size: 18px;
    cursor: pointer;
    transform: rotate(-90deg);
    transition: left 0.1s;
    &:hover {
      left: 150px;
    }
  }
}
</style>
