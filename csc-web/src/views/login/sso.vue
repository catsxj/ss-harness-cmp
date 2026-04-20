<template>
  <div></div>
</template>

<script>
import { setToken } from 'utils/auth'
import { getSSOToken } from '@/services/services/service'
import { setLoginData } from './tools'

export default {
  data() {
    return {}
  },
  created() {
    this.init()
  },
  methods: {
    async init(data) {
      const { code } = this.$route.query
      if (!code) return this.$message.error('缺少code')
      const res = await getSSOToken({
        code,
        isManager: false
      })
      if (!res.success) return
      this.$store.commit('SET_OPERATETIME')
      setLoginData(res.data)
      const lastRedirect = '/dashboard'
      const query = {}
      this.$router.push({
        path: `${lastRedirect}`,
        query
      })
      // const { token, redirect = '/dashboard' } = this.$route.query
      // setToken(token)
      // this.$router.push(redirect)
    }
  }
}
</script>
