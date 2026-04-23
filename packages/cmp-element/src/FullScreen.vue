<template>
  <div
    ref="rootEl"
    :style="isFullscreen ? wrapperStyle : undefined"
    :class="isFullscreen ? [fullscreenClass] : []"
    @click="shadeClick"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  supportFullScreen,
  fullScreenStatus,
  requestFullscreen,
  exitFullscreen,
  onFullScreenEvent,
  offFullScreenEvent
} from './fullScreenUtils'

// Vue 3 + TS port of original/cmp-element/components/full-screen/FullScreen.vue
// 原 Vue 2 options API → Vue 3 <script setup>；行为保持一致
const props = withDefaults(
  defineProps<{
    background?: string
    fullscreenClass?: string
    fullscreen?: boolean
  }>(),
  { background: '#333', fullscreenClass: 'fullscreen', fullscreen: false }
)

const emit = defineEmits<{
  change: [value: boolean]
  'update:fullscreen': [value: boolean]
}>()

const rootEl = ref<HTMLElement | null>(null)
const supports = ref(false)
const isFullscreen = ref(false)

const wrapperStyle = computed(() => ({
  background: props.background,
  'overflow-y': 'auto',
  width: '100%',
  height: '100%'
}))

function fullScreenCallback(): void {
  isFullscreen.value = fullScreenStatus()
  if (!isFullscreen.value) {
    offFullScreenEvent(fullScreenCallback)
  }
  emit('change', isFullscreen.value)
  emit('update:fullscreen', isFullscreen.value)
}

function enter(): void {
  if (!supports.value || !rootEl.value) return
  onFullScreenEvent(fullScreenCallback)
  requestFullscreen(rootEl.value)
}

function exit(): void {
  if (!supports.value) return
  exitFullscreen()
}

function toggle(value?: boolean): void {
  if (value === undefined) {
    fullScreenStatus() ? exit() : enter()
  } else {
    value ? enter() : exit()
  }
}

function getState(): boolean {
  return fullScreenStatus()
}

function shadeClick(e: MouseEvent): void {
  if (e.target === rootEl.value) exit()
}

watch(
  () => props.fullscreen,
  (value) => {
    if (value !== fullScreenStatus()) {
      value ? enter() : exit()
    }
  }
)

onMounted(() => {
  supports.value = supportFullScreen()
})

defineExpose({ toggle, enter, exit, getState })
</script>
