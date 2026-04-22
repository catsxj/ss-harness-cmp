<template>
  <el-menu :default-active="matchPath" :mode="mode" @select="selectItem" v-bind="$attrs">
    <sidebar-item v-for="route in sideMenuData" :menuItem='route' :key="route.path" :isLimitLevel="isLimitLevel" :base-path="basePath" :default-icon="defaultIcon"></sidebar-item>
  </el-menu>
</template>

<script>
import sidebarItem from './sidebarItem.vue';

export default {
  props: {
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
    limitLevel: {
      type: Number,
      default: 4
    },
    basePath: {
      type: String,
      default: '/'
    },
    matchPath: {
      type: String,
      default: ''
    },
    defaultIcon: {
      type: String,
      default: 'svg-dot'
    }
  },
  components: { sidebarItem },
  computed: {
    sideMenuData () {
      return this.filterMenuData(this.menuData);
    }
  },
  methods: {
    // 对菜单数据做过滤，去掉隐藏菜单
    filterMenuData (data) {
      const menu = [];
      data.forEach(item => {
        if (!item.hidden) {
          const cache = { ...item };
          menu.push(cache);
          if (item.children && item.path.split('/').length < this.limitLevel + 1) {
            cache.children = this.filterMenuData(item.children);
          } else {
            cache.children = null;
          }
        }
      });
      return menu.length ? menu : null;
    },
    selectItem (index) {
      this.$emit('select', index);
    }
  }
};
</script>
