<template>
  <div class="menu-wrapper" v-if="!menuItem.hidden">
    <template v-if="menuItem.children">
      <MenuItem v-if="hasOneChild(menuItem.children, menuItem)" :path="singleChild.path" :meta="singleChild.meta" :default-icon="defaultIcon"> </MenuItem>
      <el-submenu v-else :index="currPath">
        <template slot="title">
          <svg-icon :icon-name="menuItem.meta.icon || defaultIcon"></svg-icon>
          <span slot="title">{{ menuItem.meta.title }}</span>
        </template>
        <template v-for="child in menuItem.children">
          <sidebar-item class="nest-menu" v-if="!child.hidden && !isLimitLevel && child.children" :menuItem="child" :key="child.path" :base-path="currPath" :default-icon="defaultIcon"></sidebar-item>
          <MenuItem v-else-if="!child.hidden" :path="resolvePath(currPath, child.path)" :meta="child.meta" :key="child.path" :default-icon="defaultIcon"> </MenuItem>
        </template>
      </el-submenu>
    </template>
    <MenuItem v-else :path="currPath" :meta="menuItem.meta"> </MenuItem>
  </div>
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

<style></style>
