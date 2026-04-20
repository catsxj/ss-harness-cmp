<template>
  <div>
    <pre class="stdout-message" v-if="isWorkerResult()">{{ getScriptMessage(output) }}</pre>
    <json-view v-else :value="output"></json-view>
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api'
import JsonView from 'cmp-element/components/json-view/JsonView.vue'

export default defineComponent({
  components: { JsonView },
  props: {
    code: {
      type: String
    },
    output: {
      type: Object | Array
    }
  },
  setup(props) {
    // 对输出信息进行处理，返回数据可能是字符串或者json字符串
    function formatMessgae(message) {
      try {
        const obj = JSON.parse(message)
        return Object.keys(obj).reduce((total, cur) => {
          total += `${cur}：${obj[cur]}\n\n`
          return total
        }, '')
      } catch (error) {
        return message
      }
    }
    // 处理脚本输出结果
    function handleScriptRes(item) {
      return `-------------------------${item.host ? '执行主机:' + item.host : '执行结果'}-------------------------\n\n${formatMessgae(item.message)}`
    }
    function getScriptMessage(output) {
      // 批量
      if (output?.data && Array.isArray(output.data)) {
        const res = output.data.map((item) => {
          return handleScriptRes(item)
        })
        return res.join('\n\n')
      } else if (output?.message) {
        return handleScriptRes(output)
      }
      return '节点正在执行中'
    }
    // 判断是否为worker的返回结果, 除了资源组件以及数据库
    function isWorkerResult() {
      if (!props.code.includes('task.resource') && !['task.maintain.database', 'task.maintain.method'].includes(props.code)) return true
      // 接口调用如果不返回data按照worker方式展示
      if (props.code.includes('task.maintain.method') && !props.output.data) return true
      return false
    }
    return {
      getScriptMessage,
      isWorkerResult
    }
  }
})
</script>

<style scoped lang="scss">
.stdout-message {
  padding: 20px;
  background: #112435;
  color: #f08047;
  max-height: 400px;
  overflow: auto;
}
</style>
