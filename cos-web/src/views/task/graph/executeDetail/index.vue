<template>
  <common-detail class="task-detail" :title="detailData.name" @goBack="goBack" style="z-index: 4">
    <template #item_container>
      <common-detail-item label="作业名称">{{ detailData.name }}</common-detail-item>
      <common-detail-item label="执行结果">
        <status-icon :type="taskExeStatusFilter(detailData.status, 'color')">{{ taskExeStatusFilter(detailData.status) }}</status-icon>
      </common-detail-item>
      <common-detail-item label="启动人">{{ detailData.operator }}</common-detail-item>
      <common-detail-item label="开始时间">{{ detailData.gmtCreate }}</common-detail-item>
      <common-detail-item label="结束时间">{{ detailData.gmtFinish }}</common-detail-item>
      <common-detail-item label="总耗时(s)">{{ detailData.cost }}</common-detail-item>
    </template>
    <div slot="detail_header" class="pull-right">
      <el-button type="primary" @click="suspend()" class="w-ss" plain v-if="detailData.status === 'RUNNING'"> 暂停 </el-button>
      <el-button type="warning" @click="continueTask()" class="w-ss" plain v-if="detailData.status === 'SUSPENDED'"> 继续 </el-button>
      <el-button type="danger" @click="cancel()" class="w-ss" plain v-if="detailData.status === 'RUNNING' || detailData.status === 'SUSPENDED'"> 取消 </el-button>
    </div>
    <FlowEditor class="flow-editor" @nodeClick="nodeClick" ref="editor" :style="{ height: `${editHeight}px` }"></FlowEditor>
    <DetailDialog :job-id="jobId" :dialog="dialog" v-if="dialog.visible"></DetailDialog>
  </common-detail>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import DetailDialog from './detailDialog.vue'
import FlowEditor from '../flow-editor/detail.vue'
import { taskExeStatusFilter } from '@/filters/index'
import { handleReadData } from '../tools'
import { getInstanceDetail, operateInstance } from 'services/task/task'

export default {
  mixins: [webSocket],
  components: {
    FlowEditor,
    DetailDialog
  },
  props: {
    RetryTaskInstanceId: {
      default: ''
    }
  },
  data() {
    return {
      taskExeStatusFilter,
      dialog: {
        visible: false
      },
      editHeight: 0,
      detailData: {}, // 任务详情数据
      jobId: 0 // 节点详情数据
    }
  },
  computed: {
    editor() {
      return this.$refs.editor
    }
  },
  created() {
    this.getDetail()
    this.editHeight = window.innerHeight - 100
    this.$store.dispatch('GetModuleMap', this)
  },
  mounted() {
    this.$store.commit('SET_EDITOR', this.editor)
    // const timer = setInterval(() => {
    //   this.getDetail()
    // }, 1000 * 10)
    // this.$once('hook:beforeDestroy', () => {
    //   clearInterval(timer)
    // })
  },
  methods: {
    onmessage(data) {
      if (data.category === 'TaskResult' && this.$route.params.id && data.data.taskId === this.$route.params.id) {
        this.getDetail()
      }
    },
    goBack() {
      if (this.RetryTaskInstanceId) {
        this.$emit('close')
      } else {
        this.$router.go(-1)
      }
    },
    suspend() {
      this.$confirm('您确定要暂停该任务吗？', '提示', {
        confirmButtonText: '暂停',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        operateInstance(this.detailData.id, 'suspend', {
          uuid: this.detailData.uuid
        }).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getDetail()
          }
        })
      })
    },
    continueTask(node) {
      this.$confirm('您确定要继续该任务吗？', '提示', {
        confirmButtonText: '继续',
        confirmButtonClass: 'el-button--primary',
        type: 'warning'
      }).then(() => {
        operateInstance(this.detailData.id, 'active', {
          uuid: this.detailData.uuid,
          nodeId: node ? node.nodeData.id : ''
        }).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getDetail()
          }
        })
      })
    },
    cancel(node) {
      this.$confirm('您确定要取消该任务吗？', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        operateInstance(this.detailData.id, 'cancel', {
          uuid: this.detailData.uuid,
          nodeId: node ? node.nodeData.id : ''
        }).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getDetail()
          }
        })
      })
    },
    getDetail() {
      getInstanceDetail(this.$route.params.id || this.RetryTaskInstanceId).then((data) => {
        if (data.success) {
          this.detailData = data.data
          this.editor.read(handleReadData(JSON.parse(data.data.graph)))
          setTimeout(() => {
            const graph = this.editor.graph
            const edges = graph.getEdges()
            edges.forEach((edge) => {
              const targetData = edge.getTargetNode().getData() || {}
              if (targetData.status === 'RUNNING') {
                edge.attr('line/strokeDasharray', 5)
                edge.attr('line/style/animation', 'running-line 30s infinite linear')
              } else {
                edge.attr('line/strokeDasharray', '')
                edge.attr('line/style/animation', '')
              }
            })
          })
        }
      })
    },
    // 获取节点详情
    getNoderDetail(id) {
      this.jobId = id
      this.dialog.visible = true
    },
    nodeClick(item) {
      const blackCode = ['ctrl.start', 'ctrl.stop', 'task.software.role']
      if (blackCode.includes(item.model.code)) {
        return this.$message.warning('该节点不支持查看节点详情')
      }
      this.getNoderDetail(item.getData().nodeId)
    }
  }
}
</script>
<style lang="scss" scoped>
.task-detail ::v-deep .el-card__body {
  padding: 0;
}
.flow-editor {
  height: calc(100vh - 350px);
}
</style>
<style lang="scss">
@keyframes running-line {
  to {
    stroke-dashoffset: -1000;
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
