<template>
  <div id="tags-view-container" class="tags-view" v-show="isShow()">
    <ScrollPanel ref="scrollRef">
      <router-link v-for="(tag, index) in visitedViews" :key="tag.path" :to="tag" class="tags-item" :class="isActive(tag)&& 'active'" @contextmenu.prevent.stop.native="openMenu(tag,index,$event)">
        <span class="line"></span>
        <span class="">{{tag.title}}</span>
        <i class="el-icon-close" v-if="!tag.meta.fix" @click.prevent.stop="closeSelectedTag(tag,index)"></i>
        <span v-if="isActive(tag)">
          <SelectRound class="left"></SelectRound>
          <SelectRound></SelectRound>
        </span>
      </router-link>
    </ScrollPanel>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <!-- <li @click="refreshSelectedTag(selectedTag)">刷新</li> -->
      <li @click="closeSelectedTag(selectedTag)" v-if="selectedTag.meta && !selectedTag.meta.fix">关闭</li>
      <li @click="closeOthersTags" v-if="visitedViews.length !== 1">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
      <li @click="closeLeftTags(selectedTag)" v-if="selectIndex !== 0">关闭左侧</li>
      <li @click="closeRightTags(selectedTag)" v-if="selectIndex !== visitedViews.length - 1 ">关闭右侧</li>
    </ul>
  </div>
</template>

<script>
import { onMounted, reactive, toRefs, watch, ref, computed, onUnmounted } from '@vue/composition-api'
import ScrollPanel from './ScrollPanel.vue'
import SelectRound from './SelectRound.vue'
import { resolvePath } from 'utils/resolvePath'
import { nth } from 'lodash-es'
export default {
  components: { ScrollPanel, SelectRound },
  setup(props, context) {
    const state = reactive({
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      fixTags: [],
      selectIndex: 0
    })
    const scrollRef = ref(null)
    const { $store, $router } = context.root
    const visitedViews = computed(() => context.root.$store.state.tagsView.visitedViews);
    onMounted(() => {
      addFixTags();
      addTags();
      document.body.addEventListener('click', closeMenu)
    });
    onUnmounted(() => {
      document.body.removeEventListener('click', closeMenu)
    })
    watch(
      () => context.root.$route.path,
      () => {
        addTags()
      }
    )
    // 是否为激活状态
    const isActive = (route) => {
      const { meta: { parentTag } } = context.root.$route;
      let { path } = context.root.$route;
      if (parentTag) {
        path = resolvePath(path, '..')
      }
      return route.path === path
    }
    // 是否隐藏
    const isShow = () => {
      return !['ResourceDashboard', 'ScreenList'].includes(context.root.$route.name)
    }
    const getFixTags = routes => {
      const tags = [];
      routes.forEach(item => {
        const { meta, name, path, params, children } = item;
        if (meta && meta.fix) {
          tags.push({
            meta, name, path, params, children
          })
        }
        if (children && children.length) {
          tags.push(...getFixTags(children))
        }
      });
      return tags;
    }
    const routes = computed(() => context.root.$store.getters.addRoutes);
    const addFixTags = () => {
      const fixTags = getFixTags(routes.value);
      fixTags.forEach(tag => {
        context.root.$store.dispatch('tagsView/addView', tag)
      })
    }
    const addTags = () => {
      const {
        $route: { meta: { parentTag }, matched }
      } = context.root;
      let { $route: route } = context.root
      // 三级菜单展示父级tag
      if (parentTag) {
        route = nth(matched, -2);
      }
      const { path } = route;
      if (path) {
        state.activeName = path
        context.root.$store.dispatch('tagsView/addView', route)
      }
      setTimeout(() => {
        scrollRef.value.scrollToactive()
      })
      return false
    }
    // 关闭标签
    const closeSelectedTag = (view, index = state.selectIndex) => {
      state.selectIndex = index
      $store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (isActive(view)) {
          toNextView(visitedViews)
        }
      })
    }
    // 关闭其他标签
    const closeOthersTags = () => {
      if (!isActive(state.selectedTag)) $router.push(state.selectedTag)
      $store.dispatch('tagsView/delOthersViews', state.selectedTag)
    }
    // 关闭所有标签
    const closeAllTags = (view) => {
      $store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {})
    }
    // 关闭左侧标签
    const closeLeftTags = (view) => {
      const left = visitedViews.value.slice(0, state.selectIndex)
      scrollToCurrent(left, view)
      $store.dispatch('tagsView/delLeftViews', { view, index: state.selectIndex })
    }
    // 关闭左右标签后 当前页出来
    const scrollToCurrent = (views, view) => {
      const {
        $route: { path }
      } = context.root
      if (views.some((v) => v.path === path)) {
        $router.push(view.path)
      }
    }
    // 关闭右侧标签
    const closeRightTags = (view) => {
      const right = visitedViews.value.slice(state.selectIndex + 1)
      scrollToCurrent(right, view)
      $store.dispatch('tagsView/delRightViews', { view, index: state.selectIndex })
    }
    // 移动下一个标签
    const toNextView = (visitedViews) => {
      // 获取关闭页签的上一个坐标
      const index = state.selectIndex - 1 > 0 ? state.selectIndex - 1 : 0
      const latestView = visitedViews[index]
      if (latestView) {
        $router.push(latestView.fullPath)
      } else {
        $router.push('/')
      }
    }
    // 打开操作菜单
    const openMenu = (tag, index, e) => {
      const menuMinWidth = 105
      const maxLeft = window.innerWidth - menuMinWidth // left boundary
      const left = e.clientX + 15 // 15: margin right
      if (left > maxLeft) {
        state.left = maxLeft
      } else {
        state.left = left
      }
      state.top = e.clientY + 10
      state.visible = true
      state.selectedTag = tag
      state.selectIndex = index
    }
    // 关闭菜单
    function closeMenu() {
      state.visible = false
    }
    return {
      ...toRefs(state),
      scrollRef,
      isActive,
      isShow,
      visitedViews,
      closeSelectedTag,
      closeOthersTags,
      closeAllTags,
      closeLeftTags,
      closeRightTags,
      closeMenu,
      openMenu
    }
  }
}
</script>

<style lang="scss" scoped>
.tags-view {
  margin: 0px 0 8px 0;
  width: 100%;
  background: #fff;
  border: 1px solid #ededec;
  border-bottom: none;
  .tags-item {
    display: inline-block;
    position: relative;
    cursor: pointer;
    height: 32px;
    line-height: 32px;
    color: #666666;
    padding: 0 15px;
    font-size: 12px;
    &.active {
      background-color: #e7f4ff;
      color: #2d8cf0;
      border-radius: 6px 6px 0 0;
      .line {
        display: none;
      }
    }
    &:nth-child(1),
    &.active + .tags-item {
      .line {
        display: none;
      }
    }
    .line {
      width: 1px;
      height: 20px;
      background: #d9d9d9;
      display: inline-block;
      position: absolute;
      top: 6px;
      left: 0;
    }
    .el-icon-close {
      overflow: hidden;
      width: 14px;
      height: 14px;
      line-height: 14px;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      position: relative;
      top: 3px;
      left: 2px;
      border-radius: 50%;
      &:hover {
        background-color: #c0c4cc;
        color: #fff;
      }
    }
    &.active .el-icon-close,
    &:hover .el-icon-close {
      width: 14px;
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: fixed;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>
