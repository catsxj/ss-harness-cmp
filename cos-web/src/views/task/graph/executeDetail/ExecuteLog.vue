<template>
  <div class="log-container" id="logContent">
    <pre class="log-text" v-if="nodeStatus === 'RUNNING'">{{ text }}</pre>
    <div v-else v-infinite-scroll="loadLogs" :infinite-scroll-distance="20" :infinite-scroll-disabled="loading || noMore">
      <pre class="log-text">{{ text }}</pre>
      <p v-if="loading">
        <i class="el-icon-loading"></i>
        <span>加载中...</span>
      </p>
      <p v-if="noMore" class="no-more">--没有更多了--</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, onUnmounted, onMounted, nextTick, watch } from '@vue/composition-api'
import { getNodeLogs } from 'services/task/index'

export default defineComponent({
  props: {
    currentNode: {
      type: Object as PropType<any>,
      default: function () {
        return {}
      }
    }
  },
  setup(props: { currentNode: any }) {
    let targetDom: any = null
    onMounted(() => {
      targetDom = document.getElementById('logContent')
    })
    function clearTimer() {
      console.log('clear timer')
      clearInterval(timer)
      timer = 0
    }
    watch(
      () => props.currentNode,
      () => {
        if (props.currentNode.status !== 'RUNNING') {
          clearTimer()
        }
      }
    )
    if (props.currentNode.status === 'RUNNING') {
      setTimer()
    }
    onUnmounted(() => {
      clearTimer()
    })
    const handleDom = function () {
      targetDom = document.getElementById('logContent')
      targetDom.scrollTop = targetDom.scrollHeight
    }
    const text = ref('')
    async function getDoingLogs(col?: number) {
      const res = await getNodeLogs(props.currentNode.id, { end: false, priority: col })
      if (!res.success) return
      let { priority = 1, content } = res.data
      if (content) {
        text.value += `${content}\n`
        ++priority
        await nextTick()
        handleDom()
      }
      return priority
    }
    let timer: any = 0
    async function setTimer() {
      let priority = await getDoingLogs()
      timer = setInterval(async () => {
        priority = await getDoingLogs(priority)
      }, 1000 * 2)
    }
    // 获取日志
    const loading = ref(false)
    const noMore = ref(false)
    let priority = 1
    async function loadLogs() {
      loading.value = true
      const res = await getNodeLogs(props.currentNode.id, { end: true, priority })
      if (res.success) {
        const { content, last } = res.data
        noMore.value = last
        if (content) {
          text.value += `${content}\n`
          ++priority
        }
      }
      loading.value = false
    }
    return {
      loading,
      nodeStatus: props.currentNode.status,
      noMore,
      text,
      loadLogs
    }
  }
})
</script>

<style scoped lang="scss">
.log-container {
  background: rgba(0, 0, 0, 1);
  border: 1px solid #454545;
  height: 360px;
  color: #eee;
  width: 100%;
  padding: 10px;
  z-index: 4;
  box-sizing: border-box;
  overflow: auto;
  .log-text {
    margin: 0;
    line-height: 20px;
    white-space: pre-line;
  }
  .no-more {
    font-size: 12px;
    color: #bbb;
  }
}
</style>
