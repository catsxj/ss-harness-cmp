<template>
  <keep-alive :include="cachedViews" :max="cacheViewMax">
    <router-view></router-view>
  </keep-alive>
</template>
<script lang="ts" setup>
import { useStore } from 'vuex'
import { computed } from 'vue'
import { cacheViewMax } from '@/config'

const store = useStore()
const cachedViews = computed(() => store.state.tagsView.cachedViews)
</script>
