<template><div /></template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const path = (route.query.path as string | undefined) ?? '/'
  router.replace({ path })
})
</script>
