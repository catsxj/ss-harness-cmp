<template>
  <div class="full-screen-container" :style="style">
    <slot></slot>
    <div class="loading" v-if="loading">
      <dv-decoration-9 style="width:300px;height:300px;" >数据加载中</dv-decoration-9>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { debounce } from 'lodash-es'

const props = defineProps({
  width: {
    type: Number,
    default: 1920,
  },
  height: {
    type: Number,
    default: 1080,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'getScale', scale: number): void
}>()

const state = reactive({
  scale: 1 as number,
})

const style = computed(() => {
  return {
    width: `${props.width}px`,
    height: `${props.height}px`,
    transform: `scale(${state.scale})`,
  }
})

function getScale() {
  const { width, height } = props
  const wRatio = window.innerWidth / width
  const hRatio = window.innerHeight / height
  return wRatio < hRatio ? wRatio : hRatio
}

function setScale() {
  state.scale = getScale()
  emit('getScale', state.scale)
}

const onResize = debounce(setScale, 10)

onMounted(() => {
  setScale()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style lang="scss" scoped >
.full-screen-container {
  position: fixed;
  top: 0px;
  left: 0px;
  overflow: hidden;
  transform-origin: left top;
  z-index: 999;
  .loading{
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center ;
    color: rgba(255,255,255,0.8);
    font-size: 20px;
  }
}
</style>
