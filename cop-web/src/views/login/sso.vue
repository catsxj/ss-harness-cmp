<template>
  <div>
  </div>
</template>

<script>
import { setToken } from 'utils/auth'

export default {
  data() {
    return {}
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      const { token, redirect = '/home' } = this.$route.query;
      setToken(token);
      this.$router.push(redirect)
    }
  }
}
</script>
