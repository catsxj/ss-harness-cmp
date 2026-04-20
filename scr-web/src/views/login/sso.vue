<template>
  <div>
  </div>
</template>

<script setup lang="ts">
import { setLoginData } from './tools'
import { setToken } from 'utils/auth'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

function init() {
  const { token, redirect = '/home', systemCode, systemTitle } = route.query as Record<string, string>
  setToken(token)
  router.push(redirect)
  sessionStorage.setItem('systemTitle', systemTitle)
  if (systemCode) {
    sessionStorage.setItem('systemCode', systemCode)
  }
}

init()
</script>
