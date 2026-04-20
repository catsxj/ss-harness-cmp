<template>
  <a-layout class="app-wrapper" :class="[{ hideSidebar: isCollapsed }, { 'font-big': isFontBig }, { 'expire-top': expire }]" @click="setTime">
    <SystemTip />
    <Header :match-path="matchPath"></Header>
    <TagsView v-if="addRoutes"></TagsView>
    <a-layout style="overflow: hidden">
      <Sidebar v-if="showSidebar" @toggleCollapsed="toggleCollapsed" :isCollapsed="isCollapsed" :menuData="menuData" :isLimitLevel="true" :matchPath="matchPath" :basePath="basePath"></Sidebar>
      <a-layout class="main-container">
        <ThirdMenu :menuData="thirdMenuData" v-if="thirdMenuData.children"></ThirdMenu>
        <a-layout-content class="main-body">
          <el-scrollbar class="custom-scrollbar" style="flex: 1">
            <transition enter-active-class="fadeInUp" mode="out-in">
              <!-- <router-view v-if="$route.path === '/404'"></router-view> -->
              <div id="subapp-viewport" class="app-view-box"></div>
            </transition>
            <!-- <el-backtop target=".custom-scrollbar .el-scrollbar__wrap" :right="5"></el-backtop> -->
          </el-scrollbar>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script>
import { watch, ref, computed, unref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { trimStart, cloneDeep } from 'lodash-es'
import Sidebar from './components/sidebar/Sidebar.vue'
import ThirdMenu from './components/ThirdMenu.vue'
import Header from './components/Header.vue'
import TagsView from './components/TagsView/index.vue'
import SystemTip from './components/SystemTip.vue'
// import startApp from '@/core/register'
export default {
  components: {
    Header,
    SystemTip,
    Sidebar,
    ThirdMenu,
    TagsView
  },
  data() {
    return {
      matchPath: ''
    }
  },
  setup() {
    const route = useRoute()
    const store = useStore()
    // 初始化
    function init() {
      store.commit('permission/SET_BUTTONS')
      store.dispatch('GetSystemConfigs')
    }
    init()
    // onMounted(() => {
    //   console.log('micro apps register')
    //   startApp()
    // })
    // 获取三级菜单数据
    const thirdMenuData = ref({})
    function getThirdMenu(data, matchPath) {
      for (const items of data) {
        if (matchPath.includes(items.path) && items.children) {
          if (matchPath === items.path) {
            const thirdMenu = cloneDeep(items)
            // 对三级菜单隐藏的数据做剔除
            const children = []
            items.children = items.children || []
            items.children.forEach((_) => {
              if (!_.hidden) children.push(_)
            })
            thirdMenuData.value = Object.assign(thirdMenu, { children: children.length ? children : null })
          } else {
            getThirdMenu(items.children, matchPath)
          }
          break
        }
      }
    }
    // 截取当前路径
    function getLevelPath(level) {
      return `/${trimStart(route.path, '/').split('/', level).join('/')}`
    }
    // 处理路径，获取匹配的路由以及获取第三级菜单的数据
    function handlePath() {
      const matchPath = getLevelPath(3)
      // 确保刷新先更新menuData再去获取三级菜单数据
      setTimeout(() => {
        const pathLen = route.path.split('/').length
        thirdMenuData.value = {}
        if (pathLen >= 6) {
          // 寻找四级菜单
          getThirdMenu(addRoutes.value, getLevelPath(4))
        } else if (pathLen >= 5) {
          // 寻找三级菜单
          getThirdMenu(addRoutes.value, matchPath)
        }
      })
    }
    watch(
      () => route.path,
      () => {
        handlePath()
      },
      {
        immediate: true
      }
    )
    watch(thirdMenuData, (current, pre) => {
      // 当三级菜单数据有变化是触发, 有三级菜单默认收缩主菜单
      if (!current.children === !pre.children) return
      store.commit('SET_COLLAPSED', !!thirdMenuData.value.children)
    })
    const toggleCollapsed = (value) => {
      if (typeof value === 'boolean') {
        store.commit('SET_COLLAPSED', value)
      } else {
        store.commit('TOGGLE_SIDEBAR')
      }
    }
    const addRoutes = computed(() => store.state.permission.addRoutes)
    const menuData = computed(() => store.state.app.sideMenuData)
    const showSidebar = computed(() => {
      return !route.meta.hiddenSide && unref(menuData).length
    })
    function setTime() {
      store.commit('SET_OPERATETIME')
    }
    return {
      isCollapsed: computed(() => store.state.app.isCollapsed),
      basePath: computed(() => store.state.app.basePath),
      expire: computed(() => store.state.app.expire),
      isFontBig: computed(() => store.state.app.pageConfig.contentFontSize === 'big'),
      addRoutes,
      menuData,
      showSidebar,
      thirdMenuData,
      toggleCollapsed,
      setTime
    }
  },
  methods: {
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
  min-width: 1200px;
  overflow-x: auto;
}

.main-container {
  position: relative;
  height: 100%;
  background: #f5f7f9;
  .main-body {
    padding: 0 16px 12px 16px;
    display: flex;
    flex-direction: column;
  }
}
</style>
