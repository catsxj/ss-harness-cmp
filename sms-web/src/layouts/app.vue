<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedViews" :max="cacheViewMax">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTagsViewStore } from '@/stores'
import { cacheViewMax } from '@/config'

const tagsViewStore = useTagsViewStore()
const cachedViews = computed(() => tagsViewStore.cachedViews)
</script>
