<template>
  <template v-if="menuItem.children">
    <MenuItem v-if="hasOneChild(menuItem.children, menuItem)" :path="singleChild.path" :meta="singleChild.meta" :default-icon="defaultIcon"></MenuItem>
    <a-sub-menu v-else :key="currPath" class="czhj-sub-menu" popupClassName="czhj-sub-menu">
      <template #icon v-if="menuItem.meta.icon || defaultIcon">
        <svg-icon class="animated czhj-icon" :icon-name="menuItem.meta.icon || defaultIcon"></svg-icon>
      </template>
      <template #title>
        <span>{{ menuItem.meta.title }}</span>
      </template>
      <template v-for="child in menuItem.children">
        <sidebar-item class="nest-menu" v-if="!child.hidden && !isLimitLevel && child.children" :menuItem="child" :key="child.path" :base-path="currPath" :default-icon="defaultIcon"></sidebar-item>
        <MenuItem v-else-if="!child.hidden" :path="resolvePath(currPath, child.path)" :meta="child.meta" :key="`${child.path1}`" :default-icon="defaultIcon"></MenuItem>
      </template>
    </a-sub-menu>
  </template>
  <MenuItem v-else :path="currPath" :meta="menuItem.meta"></MenuItem>
</template>

<script>
import { resolvePath } from 'utils/resolvePath'
import MenuItem from './MenuItem.vue'
export default {
  components: {
    MenuItem
  },
  name: 'SidebarItem',
  data() {
    return {
      singleChild: {}
    }
  },
  props: {
    menuItem: {
      type: Object
    },
    basePath: {
      type: String
    },
    isLimitLevel: {
      type: Boolean
    },
    defaultIcon: {
      type: String
    }
  },
  computed: {
    currPath() {
      return this.resolvePath(this.basePath, this.menuItem.path)
    }
  },
  setup() {},
  methods: {
    resolvePath(basePath, routePath) {
      return resolvePath(basePath, routePath)
    },
    hasOneChild(children, parent) {
      if (children.length === 1 && !parent.meta.alwaysShow) {
        this.singleChild = children[0]
        return true
      }
      return false
    }
  }
}
</script>

<style lang="scss">
.czhj-sub-menu {
  .czhj-icon {
    font-size: 16px !important;
  }
  .ant-menu-sub {
    background-color: var(--czhj-color-background-sub) !important;
    color: var(--czhj-color-text);
  }
  &:hover .czhj-icon {
    animation-name: swing;
  }
  &:hover > .ant-menu-submenu-title > .ant-menu-submenu-arrow {
    color: var(--czhj-color-text-selected) !important;
  }
  &.ant-menu-submenu-selected {
    color: var(--czhj-color-text-selected);
  }
  .ant-menu-submenu-title:hover {
    color: var(--czhj-color-text-selected) !important;
  }
}
</style>
