<template>
  <div class="log-container">
    <div class="log-body" id="log-body">
      <pre id="pre" class="log-text">{{ realLog }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getToken } from 'utils/auth'

interface RealLogData {
  visible: boolean
  data: {
    logger?: string
    host?: string
    position?: number
    [key: string]: unknown
  }
}

const props = defineProps<{
  realLogData: RealLogData
}>()

const realLog = ref('')
// TODO: type - WebSocket 封装类型待补
const socket = ref<WebSocket | null>(null)

function init(): void {
  const setting: RealLogData['data'] = Object.assign({}, props.realLogData.data)
  const protocol = location.protocol === 'http:' ? 'ws' : 'wss'
  socket.value = new WebSocket(`${protocol}://${location.host}/api/sms/logViewService`, getToken() as string)
  const target = document.getElementById('log-body')
  const handleDom = () => {
    const height = document.getElementById('pre')?.offsetHeight ?? 0
    if (target) target.scrollTop = height
  }
  socket.value.onopen = () => {
    socket.value?.send(
      JSON.stringify({
        logger: setting.logger,
        logsize: 1024,
        host: setting.host
      })
    )
  }
  socket.value.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data)
    if (data && data.content) {
      realLog.value += data.content
      setting.position = data.position
    }
    nextTick(() => {
      handleDom()
    })
    setTimeout(() => {
      if (socket.value && socket.value.readyState === 1) {
        socket.value.send(
          JSON.stringify({
            logger: setting.logger,
            position: setting.position,
            host: setting.host
          })
        )
      }
    }, 1000)
  }
}

function exit(event: KeyboardEvent): void {
  if (event.keyCode === 27) {
    socket.value?.close()
    props.realLogData.visible = false
  }
}

onMounted(() => {
  init()
  ElMessage.info('按esc退出实时日志')
  document.addEventListener('keyup', exit, false)
})

onBeforeUnmount(() => {
  document.removeEventListener('keyup', exit, false)
  socket.value?.close()
  socket.value = null
})
</script>

<style scoped lang="scss">
.log-container {
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 101%;
  z-index: 4;
  color: #e5e5e5;
  padding: 15px;
  .log-body {
    padding: 30px 10%;
    height: 90%;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

.log-text {
  font-size: 15px;
  line-height: 20px;
  white-space: pre-line;
}
</style>
