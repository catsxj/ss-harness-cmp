<template>
  <div class="scroll-wrapper" :style="style" @mouseenter="clearTimer" @mouseleave="enableTimer">
    <slot :list="list"></slot>
  </div>
</template>
<script>
import { computed, onMounted, onUnmounted, reactive, toRefs } from '@vue/composition-api'
export default {
  props: {
    data: {
      type: Array
    },
    waitTime: {
      type: Number,
      default: 1500
    },
    singleHeight: {
      type: Number,
      default: 40
    }
  },
  setup(props) {
    const state = reactive({
      animate: false
    });
    const list = computed(() => props.data);
    const style = computed(() => {
      return state.animate ? { transition: 'all 0.5s ease-in', transform: `translate(0, -${props.singleHeight}px)` } : {};
    })
    const scrollAnimate = () => {
      state.animate = true;
      setTimeout(() => {
        state.animate = false;
        list.value.push(list.value[0]);
        list.value.shift();
      }, 500)
    }
    let timer = null;
    onMounted(() => {
      enableTimer()
    });
    onUnmounted(() => {
      clearTimer()
    });
    const enableTimer = () => {
      if (timer) clearTimer();
      timer = setInterval(scrollAnimate, props.waitTime)
    }
    const clearTimer = () => {
      clearInterval(timer);
      timer = null;
    }
    return {
      ...toRefs(state),
      list,
      style,
      enableTimer,
      clearTimer
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
