<template>
  <div class="tags-view-container">
    <span v-if="state.scrollable" class="tags_nav_operate" :class="state.scrollablePrev ? '' : 'disabled'" @click="scrollPrev">
      <el-icon><ArrowLeft /></el-icon>
    </span>
    <div class="tags-nav-scroll" ref="navScrollRef">
      <div class="tags-view-wrapper" ref="navRef" :style="navStyle">
        <slot></slot>
      </div>
    </div>
    <span v-if="state.scrollable" class="tags_nav_operate" :class="state.scrollableNext ? '' : 'disabled'" @click="scrollNext">
      <el-icon><ArrowRight /></el-icon>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUpdated, reactive, ref, getCurrentInstance } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const state = reactive({
  navOffset: 50,
  scrollable: false as boolean | Record<string, unknown>,
  scrollablePrev: false as boolean | number,
  scrollableNext: false
})
const navScrollRef = ref<HTMLDivElement | null>(null)
const navRef = ref<HTMLDivElement | null>(null)
const instance = getCurrentInstance()

const navStyle = computed(() => {
  return {
    transform: `translateX(-${state.navOffset}px)`
  }
})
onMounted(() => {
  update()
})
onUpdated(() => {
  update()
})
// 组件更新
const update = () => {
  if (!navRef.value || !navScrollRef.value) return
  const navWidth = navRef.value.offsetWidth
  const containerWidth = navScrollRef.value.offsetWidth
  const currentOffset = state.navOffset

  if (containerWidth < navWidth) {
    const currentOffset = state.navOffset
    state.scrollable = state.scrollable || {}
    state.scrollablePrev = currentOffset
    state.scrollableNext = currentOffset + containerWidth < navWidth
    if (navWidth - currentOffset < containerWidth) {
      state.navOffset = navWidth - containerWidth
    }
  } else {
    state.scrollable = false
    if (currentOffset > 0) {
      state.navOffset = 0
    }
  }
}
// 滚动到激活菜单
const scrollToactive = () => {
  const parentEl = instance?.proxy?.$el as HTMLElement | undefined
  if (!parentEl || !navScrollRef.value) return
  const activeTab = parentEl.querySelector('.tags-item.active') as HTMLElement | null
  // 不存在激活页签直接返回
  if (!activeTab) return
  const activeTabBounding = activeTab.getBoundingClientRect()
  const navScrollBounding = navScrollRef.value.getBoundingClientRect()
  const currentOffset = state.navOffset
  let newOffset = currentOffset
  if (activeTabBounding.left < navScrollBounding.left) {
    newOffset = currentOffset - (navScrollBounding.left - activeTabBounding.left)
  }
  if (activeTabBounding.right > navScrollBounding.right) {
    newOffset = currentOffset + activeTabBounding.right - navScrollBounding.right
  }
  state.navOffset = newOffset
}
// 向前滚动
const scrollPrev = () => {
  if (!navScrollRef.value) return
  const currentOffset = state.navOffset
  // 当前偏移为0时不需要移动
  if (!currentOffset) return
  const containerWidth = navScrollRef.value.offsetWidth
  // 当前偏移小于一个容器长度直接设置为0，大于时向前移动一个容器长度
  state.navOffset = currentOffset > containerWidth ? currentOffset - containerWidth : 0
}
// 向后滚动
const scrollNext = () => {
  if (!navScrollRef.value || !navRef.value) return
  const containerWidth = navScrollRef.value.offsetWidth
  const navWidth = navRef.value.offsetWidth
  const currentOffset = state.navOffset
  // 偏移量加上长度大于等于整体长度，说明已经移动到最后
  if (currentOffset + containerWidth >= navWidth) return
  const newOffset = navWidth - currentOffset > containerWidth * 2 ? currentOffset + containerWidth : navWidth - containerWidth
  state.navOffset = newOffset
}

defineExpose({
  scrollToactive,
  scrollPrev,
  scrollNext
})
</script>

<style lang="scss" scoped>
.tags-view-container {
  // height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  .tags-nav-scroll {
    position: relative;
    width: 100%;
    overflow: hidden;
    padding: 0 10px;
  }
  .tags-view-wrapper {
    transition: transform 0.3s;
    float: left;
    white-space: nowrap;
  }
  .tags_nav_operate {
    cursor: pointer;
    font-size: 12px;
    color: #909399;
    background: #ccc;
    padding: 6px;
    &.disabled {
      cursor: default;
    }
  }
}
</style>
