export default {
  computed: {
    $webSocket() {
      return this.$store.state.app.$webSocket
    }
  },
  created() {
    console.log(this.onmessage)
    this.$webSocket.onmessage = this.onmessage
  }
}
