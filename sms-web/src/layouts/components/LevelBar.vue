<template>
  <div class="level-bar-container">
    <el-breadcrumb class="app-levelbar" separator="/">
      <el-breadcrumb-item v-for="(item, key) in matchedRoute" :key="item.path">
        <span v-if="key === 0" class="first-level">
          <!-- TODO: cmp-element - 原全局 Icon 组件来自自研包，保留 DOM 占位 -->
          <i class="level-icon" :data-icon="item.meta && item.meta.icon" />
          {{ item.meta && item.meta.title }}
        </span>
        <span v-else>{{ item.meta && item.meta.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, type RouteLocationNormalizedLoaded, type RouteRecordNormalized } from 'vue-router'

const route = useRoute()
const cacheRoute = ref<Partial<RouteLocationNormalizedLoaded>>({})

function updateCache(): void {
  cacheRoute.value = { ...route }
}

const matchedRoute = computed<RouteRecordNormalized[]>(() => {
  const isRedirect = route.matched.some((item) => item.name === 'Redirect')
  let currentMatched: RouteRecordNormalized[] = []
  if (isRedirect) {
    currentMatched = (cacheRoute.value.matched as RouteRecordNormalized[]) ?? []
  } else {
    currentMatched = route.matched as RouteRecordNormalized[]
    updateCache()
  }
  return currentMatched.filter((item) => !(item.meta as { hiddenLevel?: boolean }).hiddenLevel)
})
</script>

<style scoped lang="scss">
.app-levelbar {
  display: inline-block;
  font-size: 12px;
}
.level-icon {
  font-size: 15px;
  margin-right: 5px;
  color: #b5b5b5;
}

.level-bar-container {
  height: 48px;
  line-height: 48px !important;
  :deep(.el-breadcrumb) {
    line-height: inherit;
  }
}

.first-level {
  color: #b5b5b5 !important;
}
</style>
