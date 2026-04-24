<template>
  <iframe :src="url" frameborder="0" class="iframe"></iframe>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const url = computed(() => route.meta.externalPath as string)
</script>
<style scoped>
.iframe {
  width: 100%;
  height: 100%;
  min-height: 700px;
}
</style>
