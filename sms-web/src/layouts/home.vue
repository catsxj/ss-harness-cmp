<template>
  <el-container class="app-wrapper" :class="[{ hideSidebar: isCollapsed }, { 'font-big': isFontBig }, { 'expire-top': expire }]">
    <SystemTip />
    <Header :match-path="matchPath" :is-top="isTop" @selectItem="selectItem"></Header>
    <TagsView></TagsView>
    <el-container style="overflow: hidden">
      <Sidebar v-if="menuData.length" :theme="theme" :isCollapsed="isCollapsed" :menuData="menuData" :isLimitLevel="true" :matchPath="matchPath" :basePath="basePath" :select-item="selectItem"></Sidebar>
      <el-container class="main-container">
        <!-- <ThirdMenu :menuData="thirdMenuData" v-if="thirdMenuData.children"></ThirdMenu> -->
        <el-main class="main-body">
          <el-scrollbar class="custom-scrollbar" style="flex: 1">
            <transition enter-active-class="fadeInUp" mode="out-in">
              <App />
            </transition>
            <!-- <el-backtop target=".custom-scrollbar .el-scrollbar__wrap" :right="5"></el-backtop> -->
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import { mapState } from 'vuex'
import { trimStart, cloneDeep } from 'lodash-es'
import Sidebar from './components/sidebar/sidebar.vue'
// import ThirdMenu from './components/ThirdMenu.vue'
import Header from './components/Header.vue'
import TagsView from './components/TagsView/index.vue'
import SystemTip from './components/SystemTip.vue'
import App from './app.vue'
export default {
  components: {
    Header,
    SystemTip,
    Sidebar,
    // ThirdMenu,
    TagsView,
    App
  },
  data() {
    return {
      thirdMenuData: {},
      matchPath: '',
      desktop_layout: false
    }
  },
  computed: {
    ...mapState({
      theme: (state) => state.app.theme,
      isCollapsed: (state) => state.app.isCollapsed,
      menuData: (state) => state.app.sideMenuData,
      addRoutes: (state) => state.permission.addRoutes,
      basePath: (state) => state.app.basePath,
      layout: (state) => state.app.layout,
      expire: (state) => state.app.expire,
      isFontBig: (state) => state.app.pageConfig.contentFontSize === 'big'
    }),
    isTop() {
      return this.layout === 'topmenu'
    }
  },
  watch: {
    $route() {
      this.handlePath()
    }
  },
  created() {
    this.handlePath()
    this.$store.commit('permission/SET_BUTTONS')
    this.$store.dispatch('GetSystemConfigs')
    this.desktop_layout = window.parent.DESKTOP_LAYOUT
  },
  methods: {
    // 获取三级菜单数据
    getThirdMenu(data, matchPath) {
      for (const items of data) {
        if (matchPath.includes(items.path) && items.children) {
          if (matchPath === items.path) {
            const thirdMenuData = cloneDeep(items)
            // 对三级菜单隐藏的数据做剔除
            const children = []
            items.children = items.children || []
            items.children.forEach((_) => {
              if (!_.hidden) children.push(_)
            })
            this.thirdMenuData = Object.assign(thirdMenuData, { children: children.length ? children : null })
          } else {
            this.getThirdMenu(items.children, matchPath)
          }
          break
        }
      }
    },
    // 截取当前路径
    getLevelPath(level) {
      return `/${trimStart(this.$route.path, '/').split('/', level).join('/')}`
    },
    // 处理路径，获取匹配的路由以及获取第三级菜单的数据
    handlePath() {
      this.matchPath = this.getLevelPath(3)
      // 确保刷新先更新menuData再去获取三级菜单数据
      setTimeout(() => {
        const pathLen = this.$route.path.split('/').length
        this.thirdMenuData = {}
        if (pathLen >= 6) {
          // 寻找四级菜单
          this.getThirdMenu(this.addRoutes, this.getLevelPath(4))
        } else if (pathLen >= 5) {
          // 寻找三级菜单
          this.getThirdMenu(this.addRoutes, this.matchPath)
        }
      })
    },
    // 选择菜单处理，主要处理当前菜单二次点击
    selectItem(path) {
      // const matchPath = [path, `${path}/list`]
      // if (matchPath.includes(this.$route.path)) {
      //   setTimeout(() => {
      //     this.$router.push({ name: 'Redirect', query: { path: path } })
      //   })
      // }
    }
  }
}
</script>
<style lang="scss" scoped>
.app-wrapper {
  background: #e7f4ff;
  flex-direction: column;
}

.main-container {
  position: relative;
  height: 100%;
  background: #f5f7f9;
  .main-body {
    padding: 0 8px 8px 10px;
    display: flex;
    flex-direction: column;
  }
}

.hideSidebar {
  .sidebar {
    width: 64px !important;
  }
}
</style>
