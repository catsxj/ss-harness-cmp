<template>
<keep-alive :include="cachedViews" :max="cacheViewMax">
    <router-view></router-view>
</keep-alive>
</template>
<script>
import { computed } from '@vue/composition-api'
import { cacheViewMax } from '@/config'
export default {
  setup(props, context) {
    const cachedViews = computed(() => context.root.$store.state.tagsView.cachedViews)
    return {
      cachedViews,
      cacheViewMax
    }
  }
}
</script>
