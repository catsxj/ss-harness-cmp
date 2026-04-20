export default {
  computed: {
    $webSocket() {
      return this.$store.state.app.$webSocket
    }
  },
  created() {
    this.$webSocket.onmessage = this.onmessage
  }
}
