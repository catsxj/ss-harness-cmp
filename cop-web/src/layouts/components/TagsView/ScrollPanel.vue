<template>
  <div class="tags-view-container">
    <span v-if="scrollable" class="tags_nav_operate" :class="scrollablePrev ? '' : 'disabled'" @click="scrollPrev"><i class="el-icon-arrow-left"></i></span>
    <div class="tags-nav-scroll"  ref="navScrollRef">
      <div class="tags-view-wrapper" ref="navRef" :style="navStyle">
        <slot></slot>
      </div>
    </div>
    <span v-if="scrollable" class="tags_nav_operate"  :class="scrollableNext ? '' : 'disabled'" @click="scrollNext"><i class="el-icon-arrow-right"></i></span>
  </div>
</template>

<script>
import { computed, onMounted, onUpdated, reactive, toRefs, ref } from '@vue/composition-api'
export default {
  setup(props, context) {
    const state = reactive({
      navOffset: 50,
      scrollable: false,
      scrollablePrev: false,
      scrollableNext: false
    });
    const navScrollRef = ref(null);
    const navRef = ref(null);
    const navStyle = computed(() => {
      return {
        transform: `translateX(-${state.navOffset}px)`
      };
    });
    onMounted(() => {
      update();
    });
    onUpdated(() => {
      update();
    });
    // 组件更新
    const update = () => {
      const navWidth = navRef.value.offsetWidth;
      const containerWidth = navScrollRef.value.offsetWidth;
      const currentOffset = state.navOffset;

      if (containerWidth < navWidth) {
        const currentOffset = state.navOffset;
        state.scrollable = state.scrollable || {};
        state.scrollablePrev = currentOffset;
        state.scrollableNext = currentOffset + containerWidth < navWidth;
        if (navWidth - currentOffset < containerWidth) {
          state.navOffset = navWidth - containerWidth;
        }
      } else {
        state.scrollable = false;
        if (currentOffset > 0) {
          state.navOffset = 0;
        }
      }
    }
    // 滚动到激活菜单
    const scrollToactive = () => {
      const { $el } = context.root;
      const activeTab = $el.querySelector('.tags-item.active');
      // 不存在激活页签直接返回
      if (!activeTab) return;
      const activeTabBounding = activeTab.getBoundingClientRect();
      const navScrollBounding = navScrollRef.value.getBoundingClientRect();
      const currentOffset = state.navOffset;
      let newOffset = currentOffset;
      if (activeTabBounding.left < navScrollBounding.left) {
        newOffset = currentOffset - (navScrollBounding.left - activeTabBounding.left);
      }
      if (activeTabBounding.right > navScrollBounding.right) {
        newOffset = currentOffset + activeTabBounding.right - navScrollBounding.right;
      }
      state.navOffset = newOffset;
    }
    // 向前滚动
    const scrollPrev = () => {
      const currentOffset = state.navOffset;
      // 当前偏移为0时不需要移动
      if (!currentOffset) return;
      const containerWidth = navScrollRef.value.offsetWidth;
      // 当前偏移小于一个容器长度直接设置为0，大于时向前移动一个容器长度
      state.navOffset = currentOffset > containerWidth ? currentOffset - containerWidth : 0;
    }
    // 向后滚动
    const scrollNext = () => {
      const containerWidth = navScrollRef.value.offsetWidth;
      const navWidth = navRef.value.offsetWidth
      const currentOffset = state.navOffset;
      // 偏移量加上长度大于等于整体长度，说明已经移动到最后
      if (currentOffset + containerWidth >= navWidth) return;
      const newOffset = navWidth - currentOffset > containerWidth * 2 ? currentOffset + containerWidth : (navWidth - containerWidth);
      state.navOffset = newOffset
    }
    return {
      ...toRefs(state),
      navStyle,
      navScrollRef,
      navRef,
      scrollPrev,
      scrollNext,
      scrollToactive
    }
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  // height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  .tags-nav-scroll{
    position: relative;
    width: 100%;
    overflow: hidden;
    padding: 0 10px;
  }
  .tags-view-wrapper {
    transition: transform .3s;
    float: left;
    white-space: nowrap;
  }
  .tags_nav_operate{
    cursor: pointer;
    font-size: 12px;
    color: #909399;
    background: #ccc;
    padding: 6px;
    &.disabled{
      cursor: default;
    }
  }
}
</style>
