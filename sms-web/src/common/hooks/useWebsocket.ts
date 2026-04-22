import { onUnmounted } from 'vue'
import WebSocketClient from 'cmp-socket'
import { getToken } from 'utils/auth'

export default function useWebsocket(onmessage?: (event: MessageEvent) => void) {
  const protocol = location.protocol === 'http:' ? 'ws' : 'wss'
  let webSocket: any = new WebSocketClient({
    url: `${protocol}://${location.host}/api/sms/messageService`,
    pingMsg: 'HeartBeat',
    reConnectNum: 5,
    params: getToken()
  })
  if (onmessage && typeof onmessage === 'function') {
    webSocket.onmessage = onmessage
  }
  onUnmounted(() => {
    webSocket?.Destroy?.()
    webSocket = null
  })
  return { webSocket }
}
