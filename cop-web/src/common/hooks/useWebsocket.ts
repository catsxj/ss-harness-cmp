import { onUnmounted, ref } from '@vue/composition-api'
import WebSocket from 'cmp-socket'
import { getToken } from 'utils/auth'
export default function(onmessage: {(data: any):void}) {
  const protocol = location.protocol === 'http:' ? 'ws' : 'wss'
  let webSocket = new WebSocket({
    url: `${protocol}://${location.host}/api/sms/messageService`,
    pingMsg: 'HeartBeat',
    reConnectNum: 5,
    params: getToken()
  })
  if (onmessage && typeof onmessage === 'function') {
    webSocket.onmessage = onmessage
  }
  onUnmounted(() => {
    webSocket.Destroy()
    webSocket = null
  })
  return {
    webSocket
  }
}
