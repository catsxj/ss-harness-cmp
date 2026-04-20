<template>
  <el-dialog title="作业重试" :visible.sync="addData.visible" width="1200px" v-if="addData.visible" append-to-body top="5vh" :loading="loading">
    <!-- 并非重新发起 -->
    <Graph v-if="graphDialog.visible" :graphDialog="graphDialog" Retry ref="GraphRef" @back="handleSubmit"></Graph>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.visible = false">关 闭</el-button>
      <el-button type="primary" @click="saveGraph" :loading="btnLoading">提 交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { conditionVm } from 'services/platform'
import { retryTaskRecord } from 'services/services/flow'
import Graph from '@/views/resource-apply/graph/graph.vue'
export default {
  components: { Graph },
  props: {
    addData: {
      type: Object
    }
  },
  provide() {
    // 使用函数的形式，可以访问到 `this`
    return {
      getSubApplicationParamsForTaskServer: () => this.provideVmList,
      // 获取已有的任务
      getAreadyTasks: () => this.addData.tasks || []
    }
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      graphDialog: {
        visible: false,
        task: {}
      },
      provideVmList: []
    }
  },
  async created() {
    // 校验云主机是否创建成功
    this.loading = true
    const res = await conditionVm({
      condition: 'listByIds',
      ids: this.addData.recordVmsByTask.map(({ targetId }) => targetId)
    }).finally(() => (this.loading = false))
    if (!res.success) return (this.addData.visible = false)
    if (!res.data?.length) {
      this.$message.error('查询不到作业配置对应的云主机, 请检查云主机是否被删除或者尚未创建成功')
      return (this.addData.visible = false)
    }
    if (res.data.length < this.addData.taskTargetUuidLength) {
      this.$message.error(`有${this.addData.taskTargetUuidLength - res.data.length}台虚机未查询成功, 请保证云主机创建成功`)
      return (this.addData.visible = false)
    }
    this.provideVmList = res.data.map((item) => {
      const recordVm = this.addData.recordVmsByTask.find(({ targetId }) => targetId === item.id)
      const variables = JSON.parse(recordVm.variables)
      const vmFromSubApplicationParams = variables.subApplicationParams.find(({ taskTargetUuid }) => taskTargetUuid === recordVm.targetSn)
      const res = {
        taskTargetUuid: recordVm.targetSn,
        configs: {
          user: '',
          password: '', // 直接置空
          port: '',
          vmHostName: item.name,
          osCategory: item.osCategory,
          showSpec: {
            cpu: item.cpu,
            memory: item.memory
          },
          host: item.managerIp,
          name: item.name
        },
        propModel: vmFromSubApplicationParams.propModel,
        elements: [
          {
            specs: [{ cpu: item.cpu }, { memory: item.memory }]
          }
        ]
      }
      return res
    })
    this.graphDialog = {
      visible: true,
      task: this.addData.record
    }
  },
  methods: {
    saveGraph() {
      this.$refs.GraphRef.save()
    },
    async handleSubmit() {
      // 先置空, 因为在重新配置时可能用户不会选择和申请时一样的数量
      this.graphDialog.task.taskGraphData = {}
      this.graphDialog.task.taskGraph.nodes[0].input.target.data.map((item) => {
        // 根据配置的信息获取最新的云主机信息更新 taskGraphData 参数
        this.graphDialog.task.taskGraphData[item.taskTargetUuid] = {
          host: this.provideVmList.find(({ taskTargetUuid }) => taskTargetUuid === item.taskTargetUuid).configs.host,
          rawName: this.provideVmList.find(({ taskTargetUuid }) => taskTargetUuid === item.taskTargetUuid).configs.name
        }
      })
      this.btnLoading = true
      const res = await retryTaskRecord({ id: this.addData.id, retryParamObj: this.graphDialog.task }).finally(() => {
        this.btnLoading = false
      })
      if (!res.success) return
      this.$message.success(res.message)
      this.addData.visible = false
      this.$emit('success')
    }
  }
}
</script>
