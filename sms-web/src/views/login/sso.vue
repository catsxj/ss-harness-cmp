<template>
  <div></div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { setToken } from 'utils/auth'

const route = useRoute()
const router = useRouter()

function init(): void {
  const { token, redirect = '/home' } = route.query as { token?: string; redirect?: string }
  if (token) setToken(token)
  router.push(redirect as string)
}

init()
</script>
