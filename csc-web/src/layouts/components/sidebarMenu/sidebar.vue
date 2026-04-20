<template>
  <el-aside class="sidebar-container" :class="isCollapsed && 'collapsed'" :style="style">
    <el-scrollbar class="scrollbar-wrapper">
      <BaseMenu v-bind="menuProps" :collapse="isCollapsed" class="sidebar-menu" @select="selectItem" :page-configs="pageConfigs" :is-collapsed="isCollapsed"></BaseMenu>
    </el-scrollbar>
    <OperateBtn class="operate" @click.native="toggleCollapsed">
      <i class="el-icon-arrow-down"></i>
    </OperateBtn>
  </el-aside>
</template>

<script>
import { computed, provide, ref } from '@vue/composition-api'
import BaseMenu from './baseMenu'
import OperateBtn from './OperateBtn'

export default {
  props: {
    theme: {
      type: Object
    },
    mode: {
      type: String,
      default: 'vertical'
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
      type: Function,
      default: function () {
        return () => {}
      }
    }
  },
  components: { BaseMenu, OperateBtn },
  setup(props, context) {
    const pageConfigs = computed(() => context.root.$store.getters.pageConfig)
    const isCollapsed = ref(false)
    const menuProps = computed(() => {
      const { mode, menuData, isLimitLevel, basePath, matchPath } = props
      const { menuBgColour, menuFontColour, menuFontSelectColour, menuSelectColour } = pageConfigs.value
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
    return {
      style,
      menuProps,
      pageConfigs,
      isCollapsed,
      toggleCollapsed
    }
  }
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
    ::v-deep .el-menu--collapse {
      .el-submenu {
        overflow: hidden;
        & > .el-submenu__title {
          & > span {
            height: 0;
            width: 0;
            overflow: hidden;
            visibility: hidden;
            display: inline-block;
          }
          .el-submenu__icon-arrow {
            display: none;
          }
        }
      }
    }
  }
  .scrollbar-wrapper {
    height: 100%;
    ::v-deep .el-scrollbar__wrap {
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
  ::v-deep {
    .el-submenu .el-menu-item {
      padding: 0 30px !important;
      min-width: initial;
    }
    .el-submenu__title > .icon,
    .el-menu-item > .icon {
      margin-right: 6px;
    }
    .el-menu-item.is-active {
      background-color: #ecf5ff;
    }
  }
}
</style>
