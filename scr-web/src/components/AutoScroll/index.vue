<template>
  <div class="scroll-wrapper" :style="style" @mouseenter="clearTimer" @mouseleave="enableTimer">
    <slot :list="list"></slot>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, toRefs } from 'vue'

const props = defineProps({
  data: {
    type: Array as () => unknown[],
    default: () => [],
  },
  waitTime: {
    type: Number,
    default: 1500,
  },
  singleHeight: {
    type: Number,
    default: 40,
  },
})

const state = reactive({
  animate: false,
})

const list = computed(() => props.data)

const style = computed(() => {
  return state.animate
    ? { transition: 'all 0.5s ease-in', transform: `translate(0, -${props.singleHeight}px)` }
    : {}
})

const scrollAnimate = () => {
  state.animate = true
  setTimeout(() => {
    state.animate = false
    list.value.push(list.value[0])
    list.value.shift()
  }, 500)
}

let timer: ReturnType<typeof setInterval> | null = null

const enableTimer = () => {
  if (timer) clearTimer()
  timer = setInterval(scrollAnimate, props.waitTime)
}

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  enableTimer()
})

onUnmounted(() => {
  clearTimer()
})
</script>
<style lang="scss" scoped>
</style>
