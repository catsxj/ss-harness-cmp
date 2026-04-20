<template>
  <div></div>
</template>
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
setTimeout(() => {
  router.push(route.query.path as string)
})
</script>
