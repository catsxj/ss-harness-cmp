<template>
  <el-container class="app-wrapper">
    <Header :match-path="matchPath" @selectItem="selectItem"></Header>
    <el-container class="main-container">
      <!-- <Sidebar></Sidebar> -->
      <ThirdMenu :menuData="thirdMenuData" v-if="thirdMenuData.children"></ThirdMenu>
      <el-main :style="{ padding: `${isOrderPath ? '0' : '0 20px 20px 20px'}` }">
        <!-- <el-main style="padding: 0 20px 20px 20px"> -->
        <level-bar v-show="!$route.meta.hideBreadcrumb && !isOrderPath" :icon="levelIcon"></level-bar>
        <!-- <level-bar v-show="!$route.meta.hideBreadcrumb" :icon="levelIcon"></level-bar> -->
        <el-scrollbar class="custom-scrollbar" :style="{ height: `calc(100% - ${$route.meta.hideBreadcrumb || isOrderPath ? 0 : 60}px)` }">
          <transition enter-active-class="fadeInUp" mode="out-in">
            <router-view></router-view>
          </transition>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapState } from 'vuex'
import { cloneDeep, trimStart } from 'lodash-es'
// import Sidebar from './components/sidebar/index.vue'
import LevelBar from './components/LevelBar.vue'
import ThirdMenu from './components/ThirdMenu.vue'
import Header from './components/Header.vue'

export default {
  components: {
    Header,
    // Sidebar,
    LevelBar,
    ThirdMenu
  },
  data() {
    return {
      thirdMenuData: {},
      levelIcon: '',
      matchPath: ''
    }
  },
  computed: {
    isOrderPath() {
      return this.$route.fullPath.indexOf('resource_order') >= 0
    },
    ...mapState({
      shortLogo: state => state.app.shortLogo,
      sideMenuData: state => state.permission.sideRoutes,
      userData: state => state.app.userData
    })
  },
  watch: {
    $route() {
      this.handlePath()
    }
  },
  created() {
    this.handlePath()
    // 要在页面加载前获取系统/应用系统的别名进行表格的列展示，否则页面加载后获取不到, 移动到 permission.js InitApp 中调用
    // this.$store.dispatch('GetSystemConfigs')
  },
  destroyed() {
    clearInterval(this.timer)
  },
  methods: {
    // 获取三级菜单数据
    getThirdMenu(data, matchPath) {
      this.thirdMenuData = {} // 数据重置
      for (const items of data) {
        if (matchPath.includes(items.path) && items.children) {
          if (matchPath === items.path) {
            const thirdMenuData = cloneDeep(items)
            // 对三级菜单隐藏的数据做剔除
            const children = []
            items.children = items.children || []
            items.children.forEach(_ => {
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
    getLevelPath(level) {
      return `/${trimStart(this.$route.path, '/').split('/', level).join('/')}`
    },
    handlePath() {
      this.matchPath = this.getLevelPath(1)
      const pathLen = this.$route.path.split('/').length
      if (pathLen >= 3) {
        // 存在二级菜单时获取二级菜单数据
        this.getThirdMenu(this.sideMenuData, this.matchPath)
      } else {
        this.thirdMenuData = {}
      }
    },
    selectItem(path) {
      const matchPath = [path, `${path}/list`]
      if (matchPath.includes(this.$route.path)) {
        setTimeout(() => {
          this.$router.push({ name: 'Redirect', query: { path: path } })
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.app-wrapper {
  flex-direction: column;
}

.main-container {
  height: 100%;
  background: #eef1f4;
}

.hideSidebar {
  .sidebar {
    width: 64px !important;
  }
}

/*.app-wrapper >>> .sidebar-container .logo img {*/
/*height: 50px!important;*/
/*}*/
</style>
