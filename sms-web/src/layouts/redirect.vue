<script>
export default {
  mounted() {
    const {
      query: { path }
    } = this.$route
    this.$router.replace({ path })
  },
  render: function (h) {
    return h()
  }
}
</script>
