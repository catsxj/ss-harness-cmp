<template>
  <a-layout-sider theme="light" width="160px" class="third-menu-container" :class="{ collapsed: isCollapsed }">
    <div class="menu-title">{{ menuData.meta.title }}</div>
    <el-scrollbar class="scrollbar-wrapper">
      <BaseMenu v-bind="menuProps"></BaseMenu>
    </el-scrollbar>
    <!-- <a href="javascript:;" class="subMenuToggle" @click="toggle"></a> -->
  </a-layout-sider>
</template>
<script>
import { computed } from 'vue'
import BaseMenu from './sidebar/BaseMenu.vue'
export default {
  components: { BaseMenu },
  props: {
    menuData: {
      type: Object
    }
  },
  data() {
    return {
      isCollapsed: false
    }
  },
  setup(props) {
    const menuProps = computed(() => {
      return {
        mode: 'inline',
        limitLevel: 6,
        defaultIcon: '',
        menuData: props.menuData.children,
        inlineIndent: 20
      }
    })
    return {
      menuProps
    }
  },
  methods: {
    toggle() {
      this.isCollapsed = !this.isCollapsed
    },
    selectItem(path) {
      if (this.$route.path.indexOf(path) > -1) {
        setTimeout(() => {
          this.$router.push({ name: 'Redirect', query: { path: this.$route.path } })
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.expire-top .third-menu {
  height: calc(100vh - 180px) !important;
}
.third-menu-container.collapsed {
  background: transparent !important;
  border: 0;
  margin-left: -160px;
  .third-menu,
  .menu-title {
    visibility: hidden;
  }
  .subMenuToggle {
    background: url(/web-common-resource/img/slideIcon-new.png) no-repeat right -110px;
    right: 0;
  }
}

.third-menu-container {
  background: var(--czhj-color-background);
  transition: margin 0.28s;
  border-left: 1px solid var(--czhj-color-background-selected);
  .scrollbar-wrapper {
    height: calc(100% - 40px);
    ::v-deep .el-scrollbar__wrap {
      overflow-x: hidden !important;
    }
  }
  ::v-deep(.ant-menu-item) {
    height: 38px;
    line-height: 38px;
    font-size: 12px;
  }
  .third-menu {
    height: calc(100vh - 150px);
    border: 0;
  }
}

.subMenuToggle {
  display: block;
  position: absolute;
  z-index: 2;
  left: 146px;
  top: 50%;
  width: 13px;
  height: 0;
  margin: -25px 0 0;
  padding: 50px 0 0;
  background: url(/web-common-resource/img/slideIcon-new.png) no-repeat 0 -60px;
  overflow: hidden;
  transition: width 0.1s, right 0.1s;
  &:hover {
    left: 142px;
    width: 20px;
    z-index: 3;
  }
}

.menu-title {
  visibility: visible;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  background: var(--czhj-color-background);
  border-bottom: 1px solid var(--czhj-color-background-selected);
  color: var(--czhj-color-text);
  padding-left: 20px;
}
</style>
