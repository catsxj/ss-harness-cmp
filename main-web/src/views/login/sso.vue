<template>
  <div></div>
</template>

<script setup lang="ts">
import { setToken } from 'utils/auth'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const { token, redirect = '/home' } = route.query
setToken(token)
router.push(redirect as string)
</script>
