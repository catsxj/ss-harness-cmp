<template>
  <div id="tags-view-container" class="tags-view-container">
    <el-tabs type="border-card" v-model="activeName">
      <el-tab-pane :key="tag.path" v-for="tag in visitedViews" :name="tag.path">
        <router-link slot="label" :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }" @contextmenu.prevent.stop="openMenu(tag, $event)">
          <span>{{ tag.title }}</span>
          <span><i class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)"></i></span>
        </router-link>
      </el-tab-pane>
    </el-tabs>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <!-- <li @click="refreshSelectedTag(selectedTag)">刷新</li> -->
      <li @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOthersTags">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script>
import { computed, onMounted, reactive, toRefs, watch } from 'vue'
export default {
  setup(props, context) {
    const state = reactive({
      activeName: '',
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      fixTags: []
    })
    const { $store, $router } = context.root
    const visitedViews = computed(() => context.root.$store.state.tagsView.visitedViews)
    onMounted(() => {
      addTags()
    })
    watch(
      () => context.root.$route.path,
      () => {
        addTags()
      }
    )
    watch(
      () => state.visible,
      (val) => {
        if (val) {
          document.body.addEventListener('click', closeMenu)
        } else {
          document.body.removeEventListener('click', closeMenu)
        }
      }
    )
    // 是否为激活状态
    const isActive = (route) => {
      return route.path === context.root.$route.path
    }
    const addTags = () => {
      const {
        $route,
        $route: { path }
      } = context.root
      if (path) {
        state.activeName = path
        context.root.$store.dispatch('tagsView/addView', $route)
      }
      return false
    }
    // 关闭标签
    const closeSelectedTag = (view) => {
      $store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (isActive(view)) {
          toLastView(visitedViews, view)
        }
      })
    }
    // 关闭其他标签
    const closeOthersTags = () => {
      $router.push(this.selectedTag)
      $store.dispatch('tagsView/delOthersViews', state.selectedTag).then(() => {
        // this.moveToCurrentTag()
      })
    }
    // 关闭所有标签
    const closeAllTags = (view) => {
      $store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        if (this.fixTags.some((tag) => tag.path === view.path)) {
          return
        }
        toLastView(visitedViews, view)
      })
    }
    // 移动到下一个标签
    const toLastView = (visitedViews, view) => {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        $router.push(latestView.fullPath)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    }
    // 打开操作菜单
    const openMenu = (tag, e) => {
      const $el = document.getElementById('tags-view-container')
      const menuMinWidth = 105
      const offsetLeft = $el.getBoundingClientRect().left // container margin left
      const offsetWidth = $el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right
      console.log('offsetLeft', offsetLeft, 'offsetWidth', offsetWidth, 'maxLeft', maxLeft)

      if (left > maxLeft) {
        state.left = maxLeft
      } else {
        state.left = left
      }
      state.top = e.clientY - 30
      state.visible = true
      state.selectedTag = tag
    }
    // 关闭菜单
    function closeMenu() {
      state.visible = false
    }
    return {
      ...toRefs(state),
      visitedViews,
      closeSelectedTag,
      closeOthersTags,
      closeAllTags,
      closeMenu,
      openMenu
    }
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  // height: 34px;
  // width: 100%;
  // background: #fff;
  // border-bottom: 1px solid #d8dce5;
  // box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  margin-top: 5px;
  position: relative;
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
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
  ::v-deep {
    .el-tabs--border-card,
    .el-tabs--border-card > .el-tabs__header {
      border-bottom: none;
      .el-tabs__item.is-active {
        color: #409eff;
        background-color: #fff;
        border-right-color: #fff;
        border-left-color: #fff;
      }
    }
    .el-tabs__header {
      margin: 0;
    }
    .el-tabs__item {
      margin-right: 10px;
      background: #fff;
    }
    .el-tabs__content {
      padding: 0;
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(0.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
