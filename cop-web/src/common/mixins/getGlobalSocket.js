import actions from '@/shared/action'

export default {
  computed: {
    webSocket() {
      return this.$store.state.app.$webSocket
    }
  },
  mounted() {
    if (this.webSocket) {
      // 独立应用
      this.webSocket.onmessage = this.onmessage
    } else {
      // 子应用处理方式
      actions.setGlobalState({
        onmessage: this.onmessage
      })
    }
    this.$once('hook:beforeDestroy', () => {
      if (this.webSocket) {
        this.webSocket.onmessage = null
      } else {
        actions.setGlobalState({
          onmessage: null
        })
      }
    })
  }
}
