<template>
  <el-aside width="220px" class="third-menu-container" :class="{ collapsed: isCollapsed }">
    <div class="menu-title">{{ menuData.meta.title }}</div>
    <div class="third-menu">
      <el-scrollbar class="scrollbar-wrapper">
        <BaseMenu class="third-menu" :menuData="menuData.children" :limit-level="3" :matchPath="$route.path" basePath="/" default-icon="" :otherProps="otherProps"></BaseMenu>
      </el-scrollbar>
    </div>
    <a href="javascript:;" class="sub-menu-toggle" @click="toggle">
      <i class="el-icon-arrow-left"></i>
    </a>
  </el-aside>
</template>
<script>
import BaseMenu from '@/layouts/components/sidebarMenu/baseMenu.vue'

export default {
  components: {
    BaseMenu
  },
  props: {
    menuData: {
      type: Object
    }
  },
  data() {
    return {
      isCollapsed: false,
      otherProps: {
        backgroundColor: '#FFF',
        textColor: '#303133',
        activeTextColor: '#409EFF',
        uniqueOpened: true
      }
    }
  },
  computed: {},
  created() {},
  methods: {
    toggle() {
      this.isCollapsed = !this.isCollapsed
    }
  }
}
</script>
<style lang="scss" scoped>
.third-menu-container.collapsed {
  background: transparent !important;
  border: 0;
  margin-left: -220px;
  .third-menu,
  .menu-title {
    visibility: hidden;
  }
  .sub-menu-toggle {
    left: 0px;
    &:hover {
      left: 2px;
    }
    i {
      transform: rotate(180deg);
    }
  }
}

.third-menu-container {
  background: #fff;
  transition: margin 0.28s;
  width: 160px;
  border-right: 1px solid #ebebeb;
  .third-menu {
    height: calc(100vh - 100px);
    border: 0;
    .scrollbar-wrapper {
      height: calc(100vh - 100px);
      ::v-deep .el-scrollbar__wrap {
        overflow-x: hidden !important;
      }
    }
  }
}
::v-deep {
  .el-menu-item.is-active {
    background: #e7f4ff !important;
    border-right: 2px solid #2d8cf0;
  }
  .el-menu-item:focus,
  .el-menu-item:hover,
  .el-submenu__title:hover {
    background-color: #e7f4ff !important;
  }
}

.sub-menu-toggle {
  width: 0px;
  height: 64px;
  line-height: 46px;
  color: rgb(191, 191, 191);
  border-width: 9px 9px 9px 20px;
  border-style: solid;
  border-color: transparent transparent transparent rgb(235, 235, 235);
  border-image: initial;
  border-left: 20px solid #fff;
  transition: right 0.1s ease-in-out 0s, border 0.1s ease 0s;
  display: block;
  position: absolute;
  z-index: 10;
  left: 220px;
  top: 50%;
  margin: -25px 0 0;
  &:hover {
    left: 222px;
  }
  i {
    position: relative;
    left: -19px;
    top: 12px;
    font-size: 18px;
    transform: rotate(0deg);
    transition: transform 0.5s ease-in-out 0s, left 0.1s ease-in-out 0s;
  }
}

.menu-title {
  visibility: visible;
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  background: #fff;
  border-bottom: 1px solid #ebebeb;
  color: #666;
  padding-left: 20px;
}
</style>
