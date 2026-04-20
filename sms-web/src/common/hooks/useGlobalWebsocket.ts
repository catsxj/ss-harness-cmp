import { useAppStore } from '@/stores/app'

export default function useGlobalWebsocket(onmessage: (event: MessageEvent) => void): void {
  const appStore = useAppStore()
  const ws = appStore.$webSocket as { onmessage?: (event: MessageEvent) => void } | null
  if (ws) ws.onmessage = onmessage
}
