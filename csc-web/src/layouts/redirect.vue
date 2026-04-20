<template>
  <div></div>
</template>

<script>
export default {
  beforeCreate() {
    if (this.$route.query.path.indexOf('/resource/balancer_detail') > -1 || this.$route.query.path.indexOf('/resource/balancer_listen_detail') > -1) this.$router.push({ name: 'balancer' })
    else this.$router.replace({ path: this.$route.query.path, query: this.$route.query.query, params: this.$route.params })
  }
}
</script>
