<template>
  <a-menu class="czhj-menu" :mode="mode" :inlineIndent="inlineIndent" @click="clickMenu" @openChange="handleOpenChange" :openKeys="openKeys" :selectedKeys="urlToList($route.path)" v-bind="$attrs">
    <sidebar-item v-for="route in sideMenuData" :menuItem="route" :key="route.path" :isLimitLevel="isLimitLevel" :base-path="basePath" :default-icon="defaultIcon"></sidebar-item>
  </a-menu>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SidebarItem from './SidebarItem.vue'
import { urlToList } from './utils'
import { useLink } from './useLink'
import useOpenKeys from './useOpenKeys'

export default defineComponent({
  components: { SidebarItem },
  props: {
    mode: {
      type: String,
      default: 'vertical'
    },
    menuData: {
      type: Array
    },
    isCollapsed: {
      type: Boolean,
      default: false
    },
    mainMenu: {
      type: Boolean,
      default: false
    },
    inlineIndent: {
      type: Number,
      default: 12
    },
    isLimitLevel: {
      type: Boolean,
      default: false
    },
    limitLevel: {
      type: Number,
      default: 4
    },
    basePath: {
      type: String,
      default: '/'
    },
    defaultIcon: {
      type: String,
      default: 'svg-dot'
    }
  },
  setup(props, context) {
    // 对菜单数据做过滤，去掉隐藏菜单
    function filterMenuData(data: any) {
      const menu: any[] = []
      data.forEach((item: any) => {
        if (!item.hidden) {
          const cache = { ...item }
          menu.push(cache)
          if (item.children && item.path.split('/').length < props.limitLevel + 1) {
            cache.children = filterMenuData(item.children)
          } else {
            cache.children = null
          }
        }
      })
      return menu.length ? menu : null
    }
    const sideMenuData = computed(() => filterMenuData(props.menuData))
    // 菜单展示
    const { openKeys, handleOpenChange } = useOpenKeys({
      mainMenu: props.mainMenu
    })
    // 界面跳转
    const goPage = useLink()
    function clickMenu({ key }: { key: string }) {
      goPage(key)
    }
    return {
      sideMenuData,
      clickMenu,
      urlToList,
      openKeys,
      handleOpenChange
    }
  }
})
</script>
<style lang="scss" scoped>
.czhj-menu {
  background: var(--czhj-color-background);
  color: var(--czhj-color-text);
  border-right: none;
  height: 100%;
  ::v-deep(.ant-menu-submenu-arrow) {
    color: var(--czhj-color-text);
  }
}
</style>
