<template>
  <div>
  </div>
</template>

<script>
import crypto from 'utils/crypto.js'
import { setLoginData } from './tools'
import { getTokenInfo } from 'services/system'
import { setToken } from 'utils/auth'

export default {
  data() {
    return {}
  },
  created() {
    this.init()
  },
  methods: {
    init(data) {
      const { token, redirect = '/home', systemCode, systemTitle } = this.$route.query;
      setToken(token);
      this.$router.push(redirect);
      sessionStorage.setItem('systemTitle', systemTitle)
      if (systemCode) {
        sessionStorage.setItem('systemCode', systemCode)
      }
    }
  }
}
</script>
