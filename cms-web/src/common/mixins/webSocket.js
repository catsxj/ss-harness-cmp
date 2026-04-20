import WebSocket from 'cmp-socket'
import { getToken } from 'utils/auth'
export default {
  data() {
    return {
      webSocket: ''
    }
  },
  created() {
    const protocol = location.protocol === 'http:' ? 'ws' : 'wss'
    this.webSocket = new WebSocket({
      url: `${protocol}://${location.host}/api/sms/messageService`,
      commonFun: this.messageCommonFun,
      pingMsg: 'HeartBeat',
      reConnectNum: 5,
      params: getToken()
    })
    if (this.onmessage && typeof this.onmessage === 'function') {
      this.webSocket.onmessage = this.onmessage
    }
  },
  destroyed() {
    this.webSocket.Destroy()
    this.webSocket = null
  },
  methods: {
    messageCommonFun() {}
  }
}
