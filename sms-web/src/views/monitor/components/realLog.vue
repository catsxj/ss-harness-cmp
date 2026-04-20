<template>
  <div class="log-container">
    <div class="log-body" id="log-body">
      <pre id="pre" class="log-text">{{ realLog }}</pre>
    </div>
  </div>
</template>

<script>
/* global $ */
import { getToken } from 'utils/auth'
export default {
  props: {
    realLogData: {
      type: Object
    }
  },
  data() {
    return {
      realLog: '',
      socket: ''
    }
  },
  mounted() {
    this.init()
    this.$message.info('按esc退出实时日志')
    document.addEventListener('keyup', this.exit, false)
  },
  beforeDestroy() {
    document.removeEventListener('keyup', this.exit, false)
  },
  methods: {
    init() {
      const that = this
      const setting = Object.assign({}, this.realLogData.data)
      const protocol = location.protocol === 'http:' ? 'ws' : 'wss'
      this.socket = new WebSocket(`${protocol}://${location.host}/api/sms/logViewService`, getToken())
      const target = document.getElementById('log-body')
      const handleDom = function () {
        const height = document.getElementById('pre').offsetHeight
        target.scrollTop = height
      }
      this.socket.onopen = function () {
        that.socket.send(
          JSON.stringify({
            logger: setting.logger,
            logsize: 1024,
            host: setting.host
          })
        )
      }
      this.socket.onmessage = function (event) {
        const data = JSON.parse(event.data)
        if (data && data.content) {
          that.realLog += data.content
          setting.position = data.position
        }
        that.$nextTick(() => {
          handleDom()
        })
        setTimeout(function () {
          if (that.socket.readyState == 1) {
            that.socket.send(
              JSON.stringify({
                logger: setting.logger,
                position: setting.position,
                host: setting.host
              })
            )
          }
        }, 1000)
      }
    },
    exit(event) {
      if (event.keyCode === 27) {
        this.socket.close()
        this.realLogData.visible = false
      }
    }
  }
}
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
