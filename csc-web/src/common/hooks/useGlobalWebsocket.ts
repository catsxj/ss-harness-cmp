export default function (onmessage: { (): void }, context: any) {
  context.root.$store.state.app.$webSocket.onmessage = onmessage
}
