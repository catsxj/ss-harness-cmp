<template>
  <el-dialog title="节点详情" :close-on-click-modal="false" :visible.sync="dialog.visible" width="1000px" append-to-body>
    <div v-loading="loading" style="min-height: 200px">
      <el-row v-if="!loading">
        <el-col :span="24">
          <table class="detail-table">
            <tr>
              <td class="title">节点名称</td>
              <td>{{ data.name }}</td>
              <td class="title">节点类型</td>
              <td>
                <el-tag>{{ moduleMap[data.code].name }}</el-tag>
              </td>
              <td class="title">认证方式</td>
              <td>
                <el-tag>{{ authenMode }}</el-tag>
              </td>
              <td class="title">总时间(s)</td>
              <td>
                {{ data.cost }}
              </td>
            </tr>
            <tr>
              <td class="title">节点状态</td>
              <td>
                <status-icon :type="taskExeStatusFilter(data.status, 'color')"> {{ taskExeStatusFilter(data.status, 'name') }}</status-icon>
              </td>
              <td class="title">开始时间</td>
              <td style="min-width: 105px">{{ data.gmtStart }}</td>
              <td class="title">结束时间</td>
              <td style="min-width: 105px">{{ data.gmtFinish }}</td>
              <td class="title">超时时间(s)</td>
              <td>{{ data.control.timeout }}</td>
            </tr>
            <tr>
              <td class="title">失败重试</td>
              <td>{{ booleanFilter(data.control.failover || '无') }}</td>
              <td class="title">重试设置</td>
              <td>{{ data.control.failover ? `${data.control.retryTime}次/${data.control.intervals}秒` : '无' }}</td>
              <td class="title">成功暂停</td>
              <td>{{ booleanFilter(data.control.suspensible) }}</td>
              <td class="title">暂停描述</td>
              <td>{{ data.control.suspensible ? data.control.suspendMsg : '' }}</td>
            </tr>
          </table>
        </el-col>
        <el-col :span="24">
          <el-tabs class="m-t-sm" value="output">
            <el-tab-pane name="output" lazy>
              <span slot="label" class="tab-label-padding">输出结果</span>
              <OutputResult :code="data.code" :output="data.output" />
            </el-tab-pane>
            <el-tab-pane name="success" v-if="data.successes.length" lazy>
              <span slot="label" class="tab-label-padding">执行成功({{ data.successes.length }})</span>
              <ResultServer :code="data.code" :data="data.successes"></ResultServer>
            </el-tab-pane>
            <el-tab-pane name="failures" v-if="data.failures.length" lazy>
              <span slot="label" class="tab-label-padding">执行失败({{ data.failures.length }})</span>
              <ResultServer :code="data.code" :data="data.failures"></ResultServer>
            </el-tab-pane>
            <el-tab-pane label="执行日志" name="log" lazy>
              <span class="tab-label-padding" slot="label">执行日志</span>
              <execute-log :current-node="data"></execute-log>
            </el-tab-pane>
            <el-tab-pane label="配置详情" name="detail" v-if="data.code !== 'task.software.exporter'" lazy>
              <span class="tab-label-padding" slot="label">配置详情</span>
              <Component ref="node" :is="component" :current-node="data"></Component>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<script>
import { ref, unref } from '@vue/composition-api'
import ResultServer from './resultServer.vue'
import MaintainNode from '../maintain/index.vue'
import ResourceNode from '../resource/index.vue'
import SoftwareNode from '../software/index.vue'
import JudgeNode from '../control/judgeNode.vue'
import ExecuteLog from './ExecuteLog.vue'
import OutputResult from './OutputResult.vue'
import useWebsocket from 'hooks/useWebsocket'
import { getInstanceNode } from 'services/task/task'
import { taskExeStatusFilter, booleanFilter } from '@/filters/index'

export default {
  components: {
    ResultServer,
    MaintainNode,
    ResourceNode,
    SoftwareNode,
    JudgeNode,
    OutputResult,
    ExecuteLog
  },
  props: {
    dialog: {
      type: Object
    },
    jobId: {
      type: Number
    }
  },
  setup(props, context) {
    useWebsocket(data => {
      if (data.category === 'TaskResult' && data.data.taskId === context.root.$route.params.id) {
        getNodeData()
      }
    })
    const data = ref({})
    const loading = ref(true)
    async function getNodeData(isInit) {
      // 是否初始调用
      const res = await getInstanceNode(props.jobId)
      if (res.success) {
        const { control, input, output, ...others } = res.data
        data.value = {
          control: JSON.parse(control) || {},
          input: JSON.parse(input),
          output: JSON.parse(output),
          ...others
        }
        if (isInit) initComponent()
      }
      loading.value = false
    }
    getNodeData(true)
    // 设置组件
    const component = ref('')
    function initComponent() {
      const node = unref(data)
      if (node.code.indexOf('task.maintain') > -1) {
        component.value = 'MaintainNode'
      } else if (node.code.indexOf('task.resource') > -1) {
        component.value = 'ResourceNode'
      } else if (node.code.indexOf('task.software') > -1) {
        component.value = 'SoftwareNode'
      } else {
        component.value = 'JudgeNode'
      }
    }
    return {
      booleanFilter,
      taskExeStatusFilter,
      loading,
      component,
      data
    }
  },
  computed: {
    moduleMap() {
      return this.$store.state.graph.moduleMap
    },
    nodeData() {
      return this.data?.input.fronts
    },
    authenMode() {
      const { target } = this.data?.input
      if (target) {
        const obj = {
          BATCH: '批量认证',
          TRUST: '互信认证',
          SINGLE: '单一认证'
        }
        return obj[target.authenMode] || '无'
      }
      return '无'
    }
    // activeName() {
    //   // if (this.data.code !== 'task.software.exporter') return 'detail'
    //   // if (this.data.successes.length) return 'success'
    //   // if (this.data.failures.length) return 'failures'
    //   return 'output'
    // }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>
<style scoped>
.detail-table td,
.detail-table th {
  white-space: nowrap;
}
</style>
