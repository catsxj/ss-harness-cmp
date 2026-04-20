<template>
  <ul class="header-menu">
    <!-- <template v-if="menuData.length > 1">
      <li v-for="item in menuData"  @click="selectMenu(item, 1)" :key="item.id" :class="{selected: item.selected}" :style="getStyle(item)">
        <svg-icon class="icon" :icon-name="item.meta.icon"></svg-icon>
        <span>{{item.meta.title}}</span>
      </li>
    </template> -->
  </ul>
</template>
<script>
export default {
  props: {
    pageConfigs: Object
  },
  // watch: {
  //   firstPath () {
  //     // 左侧菜单刷新不用重置菜单数据
  //     if (this.$route.name !== 'Redirect') this.initMenu('firstPath');
  //   },
  //   menuData: {
  //     handler: function () {
  //       this.initMenu('menuData');
  //     },
  //     immediate: true
  //   }
  // },
  computed: {
    firstPath: function () {
      return `/${this.$route.path.split('/')[1]}`
    },
    menuData() {
      return this.$store.state.permission.addRoutes.filter((item) => !item.hidden)
    },
    hideHeadMenu() {
      return this.menuData.filter((item) => !item.hidden).length === 1
    }
  },
  created() {},
  methods: {
    getStyle(item) {
      if (item.selected) {
        return {
          backgroundColor: this.pageConfigs.headerSelectColour,
          color: this.pageConfigs.headerFontSelectColour
        }
      }
    },
    getJumpRoute(data) {
      const route = data[0]
      if (route.children) {
        return this.getJumpRoute(route.children)
      }
      return route.path
    },
    // 重置菜单数据 flag:是否重置菜单书局
    resetMenu(flag) {
      this.menuData.forEach((row) => {
        this.$set(row, 'selected', false)
      })
      if (flag) {
        this.$store.commit('SETTING_SIDE_MENU', [])
        this.$store.commit('SETTING_BASE_PATH', '/')
      }
    },
    selectMenu(item, flag) {
      if (item.selected) return
      this.resetMenu()
      const menu = this.menuData.find((cell) => cell.id === item.id)
      menu.selected = true
      // 处理一级菜单没有子菜单的情况
      const menus = menu.children.filter((item) => !item.hidden)
      if (menus.length) {
        this.$store.commit('SETTING_SIDE_MENU', menu.children)
        this.$store.commit('SETTING_BASE_PATH', menu.path)
      } else {
        this.resetMenu(true)
      }
      // 点击一级菜单时跳转界面，刷新界面是保持不动
      if (flag) {
        this.$router.push({ path: this.getJumpRoute(menu.children) })
      }
    },
    initMenu(flag) {
      // 没有任何菜单信息时直接return
      if (!this.menuData || this.menuData.length === 0) return
      const selectMenu = this.menuData.find((item) => item.path === this.firstPath)
      if (selectMenu) {
        this.selectMenu(selectMenu, this.$route.name === 'Home')
      } else {
        this.resetMenu(1)
      }
    }
  }
}
</script>
<style lang="scss">
ul.header-menu {
  margin: 0;
  list-style: none;
  flex: 1;
  display: flex;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  li {
    display: flex;
    align-items: center;
    font-size: 14px;
    position: relative;
    height: 48px;
    cursor: pointer;
    white-space: nowrap;
    padding: 0 20px;
    float: left;
    .icon {
      font-size: 14px;
      margin-right: 4px;
    }
    &.selected {
      color: #fff;
      background: #15171d;
    }
    div {
      display: none;
      position: absolute;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
