<template>
  <span>
    <Link :to="path">
      <el-menu-item :index="path" ref="menuItemRef" :style="style" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" @blur="onMouseLeave">
        <svg-icon :icon-name="meta.icon || defaultIcon"></svg-icon>
        <template #title>
          <span>{{ meta.title }}</span>
        </template>
      </el-menu-item>
    </Link>
  </span>
</template>

<script setup lang="ts">
import { inject, ref, computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import Link from './Link.vue'

interface MenuMeta {
  title?: string
  icon?: string
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    path: string
    meta: MenuMeta
    defaultIcon?: string
  }>(),
  {
    defaultIcon: ''
  }
)

// TODO: type - el-menu-item 实例无导出类型
const menuItemRef = ref<any>(null)
const route = useRoute()
const bgColor = inject<ComputedRef<string>>('backgroundActiveColor', computed(() => ''))

const isActivePath = () => {
  return route.path.includes(props.path)
}
const style = computed(() => {
  if (isActivePath()) {
    return {
      background: bgColor.value
    }
  }
  return {}
})
const onMouseEnter = () => {
  if (menuItemRef.value?.$el) {
    menuItemRef.value.$el.style.backgroundColor = bgColor.value
  }
}
const onMouseLeave = () => {
  // 延时的目的是在el-menu-item 后执行
  if (isActivePath() && menuItemRef.value?.$el) {
    menuItemRef.value.$el.style.backgroundColor = bgColor.value
  }
}
</script>
