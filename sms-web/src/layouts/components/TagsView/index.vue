<template>
  <div id="tags-view-container" class="tags-view" v-show="isShow()">
    <ScrollPanel ref="scrollRef">
      <router-link v-for="(tag, index) in visitedViews" :key="tag.path" :to="tag" custom v-slot="{ navigate }">
        <span class="tags-item" :class="isActive(tag) && 'active'" @click="navigate" @contextmenu.prevent.stop="openMenu(tag, index, $event)">
          <span class="line"></span>
          <span class="">{{ tag.title }}</span>
          <el-icon v-if="!tag.meta.fix" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag, index)"><Close /></el-icon>
          <span v-if="isActive(tag)">
            <SelectRound class="left"></SelectRound>
            <SelectRound></SelectRound>
          </span>
        </span>
      </router-link>
    </ScrollPanel>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <!-- <li @click="refreshSelectedTag(selectedTag)">刷新</li> -->
      <li @click="closeSelectedTag(selectedTag)" v-if="selectedTag.meta && !selectedTag.meta.fix">关闭</li>
      <li @click="closeOthersTags" v-if="visitedViews.length !== 1">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
      <li @click="closeLeftTags(selectedTag)" v-if="selectIndex !== 0">关闭左侧</li>
      <li @click="closeRightTags(selectedTag)" v-if="selectIndex !== visitedViews.length - 1">关闭右侧</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch, ref, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close } from '@element-plus/icons-vue'
import ScrollPanel from './ScrollPanel.vue'
import SelectRound from './SelectRound.vue'
import { resolvePath } from 'utils/resolvePath'
import { nth } from 'lodash-es'
import { usePermissionStore, useTagsViewStore } from '@/stores'
import type { TagView } from '@/stores/tagsView'

interface RouteLike {
  path: string
  name?: string
  params?: Record<string, unknown>
  meta?: Record<string, unknown>
  children?: RouteLike[]
  fullPath?: string
}

// TODO: type - ScrollPanel 子组件通过 ref 暴露 scrollToactive
const scrollRef = ref<any>(null)
const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
const tagsViewStore = useTagsViewStore()

const state = reactive<{
  visible: boolean
  top: number
  left: number
  selectedTag: Partial<TagView> & { meta?: Record<string, unknown> }
  fixTags: TagView[]
  selectIndex: number
}>({
  visible: false,
  top: 0,
  left: 0,
  selectedTag: {},
  fixTags: [],
  selectIndex: 0
})

const visible = computed(() => state.visible)
const top = computed(() => state.top)
const left = computed(() => state.left)
const selectedTag = computed(() => state.selectedTag)
const selectIndex = computed(() => state.selectIndex)

const visitedViews = computed(() => tagsViewStore.visitedViews)

onMounted(() => {
  addFixTags()
  addTags()
  document.body.addEventListener('click', closeMenu)
})
onUnmounted(() => {
  document.body.removeEventListener('click', closeMenu)
})
watch(
  () => route.path,
  () => {
    addTags()
  }
)
// 是否为激活状态
const isActive = (tag: TagView) => {
  const parentTag = (route.meta as any)?.parentTag
  let path = route.path
  if (parentTag) {
    path = resolvePath(path, '..')
  }
  return tag.path === path
}
// 是否隐藏
const isShow = () => {
  return !['/resource_dashboard', 'ScreenList', '/test'].includes(route.path)
}
const getFixTags = (routes: RouteLike[]): TagView[] => {
  const tags: TagView[] = []
  routes.forEach((item) => {
    const { meta, name, path, params, children } = item
    if (meta && (meta as any).fix) {
      tags.push({
        meta: meta as TagView['meta'],
        name: name as string,
        path,
        params,
        children
      } as TagView)
    }
    if (children && children.length) {
      tags.push(...getFixTags(children))
    }
  })
  return tags
}
const routes = computed<RouteLike[]>(() => (permissionStore.addRoutes as unknown as RouteLike[]) || [])
const addFixTags = () => {
  const fixTags = getFixTags(routes.value)
  fixTags.forEach((tag) => {
    tagsViewStore.addView(tag)
  })
}
const addTags = () => {
  const parentTag = (route.meta as any)?.parentTag
  const matched = route.matched
  let target: any = route
  // 三级菜单展示父级tag
  if (parentTag) {
    target = nth(matched as any[], -2)
  }
  const path = target?.path
  if (path) {
    tagsViewStore.addView(target as TagView)
  }
  setTimeout(() => {
    scrollRef.value?.scrollToactive()
  })
  return false
}
// 关闭标签
const closeSelectedTag = (view: TagView, index = state.selectIndex) => {
  state.selectIndex = index
  tagsViewStore.delView(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toNextView(visitedViews)
    }
  })
}
// 关闭其他标签
const closeOthersTags = () => {
  if (!isActive(state.selectedTag as TagView)) router.push(state.selectedTag as any)
  tagsViewStore.delOthersViews(state.selectedTag as TagView)
}
// 关闭所有标签
const closeAllTags = (_view: TagView) => {
  tagsViewStore.delAllViews()
}
// 关闭左侧标签
const closeLeftTags = (view: TagView) => {
  const left = visitedViews.value.slice(0, state.selectIndex)
  scrollToCurrent(left, view)
  tagsViewStore.delLeftViews({ view, index: state.selectIndex })
}
// 关闭左右标签后 当前页出来
const scrollToCurrent = (views: TagView[], view: TagView) => {
  const path = route.path
  if (views.some((v) => v.path === path)) {
    router.push(view.path)
  }
}
// 关闭右侧标签
const closeRightTags = (view: TagView) => {
  const right = visitedViews.value.slice(state.selectIndex + 1)
  scrollToCurrent(right, view)
  tagsViewStore.delRightViews({ view, index: state.selectIndex })
}
// 移动下一个标签
const toNextView = (views: TagView[]) => {
  // 获取关闭页签的上一个坐标
  const index = state.selectIndex - 1 > 0 ? state.selectIndex - 1 : 0
  const latestView = views[index]
  if (latestView) {
    router.push((latestView as any).fullPath || latestView.path)
  } else {
    router.push('/')
  }
}
// 打开操作菜单
const openMenu = (tag: TagView, index: number, e: MouseEvent) => {
  const menuMinWidth = 105
  const maxLeft = window.innerWidth - menuMinWidth // left boundary
  const leftPos = e.clientX + 15 // 15: margin right
  if (leftPos > maxLeft) {
    state.left = maxLeft
  } else {
    state.left = leftPos
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
