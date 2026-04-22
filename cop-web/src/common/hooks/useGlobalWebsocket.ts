import { computed, onUnmounted, unref } from '@vue/composition-api'
import actions from '@/shared/action'

export default function(onmessage: {(data: any):void}, store: any) {
  const webSocket = computed(() => store.state.app.$webSocket);
  console.log(webSocket)
  if (unref(webSocket)) {
    webSocket.value.onmessage = onmessage
  } else {
    actions.setGlobalState({
      name: 'cop-web',
      onmessage
    })
  }
  onUnmounted(() => {
    if (unref(webSocket)) {
      webSocket.value.onmessage = null
    } else {
      actions.setGlobalState({
        name: 'cop-web',
        onmessage: null
      })
    }
  })
}
