<template>
  <el-dialog title="执行任务" :visible.sync="addData.visible" width="1200px" v-if="addData.visible" append-to-body>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column prop="name" label="任务名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <span key="VM_APPLY_TASK" @click="openTaskDetail(scope.row.taskInstanceId)" v-if="scope.row.type === 'VM_APPLY_TASK'" class="detail-href">
            {{ scope.row.name }}
          </span>
          <span key="VM_APPLY" v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="config" label="配置" show-overflow-tooltip width="120px"></el-table-column>
      <el-table-column prop="status" label="任务状态" show-overflow-tooltip width="70px">
        <template slot-scope="scope">
          <status-icon :type="statusColorFilter(scope.row.status)">{{ statusFilter(scope.row.status) }} </status-icon>
        </template>
      </el-table-column>
      <el-table-column prop="gmtStart" label="开始时间" show-overflow-tooltip width="150px"></el-table-column>
      <el-table-column prop="gmtEnd" label="结束时间" show-overflow-tooltip width="150px"></el-table-column>
      <el-table-column prop="cos" label="总耗时" show-overflow-tooltip width="100px">
        <template slot-scope="scope"> {{ ((scope.row.cos || 0) / 1000).toFixed(4) * 1 }}（s）</template>
      </el-table-column>
      <el-table-column prop="msg" label="原因" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <el-button type="text" :loading="scope.row.loading" :disabled="scope.row.btnDisabled" @click="retry(scope.row)">重试</el-button>
          <el-button type="text" :loading="scope.row.loading" :disabled="scope.row.btnDisabled" v-if="scope.row.type === 'VM_APPLY'" @click="associateResource(scope.row)">关联资源</el-button>
        </template>
      </el-table-column>
    </basic-table>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.visible = false">关 闭</el-button>
    </div>
    <AssociateResource v-if="associateResourceDialog.visible" :addData="associateResourceDialog" @success="getList"></AssociateResource>
    <!-- 虚拟机重试 -->
    <Retry v-if="retryDialog.visible && retryDialog.type === 'VM_APPLY'" :addData="retryDialog" @success="getList"></Retry>
    <!-- 作业编排重试 -->
    <RetryTask v-if="retryDialog.visible && retryDialog.type === 'VM_APPLY_TASK'" :addData="retryDialog" @success="getList"></RetryTask>
    <!-- 作业详情 -->
    <taskDetailDialog v-if="taskDetailDialog.visible" :addData="taskDetailDialog" @success="getList"></taskDetailDialog>
  </el-dialog>
</template>

<script>
import { getTaskRecord } from 'services/services/flow'
import AssociateResource from './AssociateResource.vue'
import TaskDetailDialog from './TaskDetailDialog.vue'
import Retry from './Retry.vue'
import RetryTask from './RetryTask.vue'
export default {
  components: { AssociateResource, Retry, RetryTask, TaskDetailDialog },
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      associateResourceDialog: {
        visible: false,
        id: '',
        vendorType: ''
      },
      taskDetailDialog: {
        visible: false,
        taskInstanceId: ''
      },
      retryDialog: {
        type: '',
        visible: false,
        id: '',
        record: ''
      }
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    associateResource(record) {
      this.associateResourceDialog = {
        visible: true,
        id: record.id,
        vendorType: JSON.parse(record.variables || '{}').subApplicationParams?.[0].subLocation.vendorType,
        vendorId: JSON.parse(record.variables || '{}').subApplicationParams?.[0].subLocation.vendorId
      }
    },
    openTaskDetail(taskInstanceId) {
      this.taskDetailDialog = {
        visible: true,
        taskInstanceId
      }
    },
    async retry(record) {
      const type = record.type
      if (type === 'VM_APPLY') {
        this.retryDialog = {
          type,
          visible: true,
          id: record.id,
          // 构造参数,保持和已审批详情页面一致
          record: {
            ApplyCategory: 'EFCApplicationOperate', // 云主机申请
            ApplyParams: record.variables
          }
        }
      }
      if (type === 'VM_APPLY_TASK') {
        const variables = JSON.parse(record.variables || '{}')
        // 让用户重新配置
        // 可能会存在各种情况导致密码/用户名/端口等配置不正确, 所致直接重新选择得了
        variables.configStatus = 'NotConfig'
        const taskTargetUuids = variables.taskGraph.nodes.reduce((acc, node) => {
          // 可能存在多个节点并且选择的虚机不是相同的几个, 需要合并并且去重
          return [...new Set([...acc, ...node.input.target.data.map(({ taskTargetUuid }) => taskTargetUuid)])]
        }, [])
        if (!taskTargetUuids.length) return this.$message.error('任务详情内无作业配置')
        const recordVmsByTask = this.list.filter(({ targetSn }) => taskTargetUuids.includes(targetSn))
        this.retryDialog = {
          type,
          visible: true,
          recordVmsByTask,
          // 作业配置的虚机数量
          taskTargetUuidLength: taskTargetUuids.length,
          id: record.id,
          // 构造参数
          record: variables
        }
      }
    },
    getList() {
      getTaskRecord(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows.map((item) => {
            item.loading = false
            item.btnDisabled = !['FAILED', 'FAIL'].includes(item.status)
            return item
          })
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        workOrderFlowNo: this.addData.workOrderFlowNo
      })
      this.getList()
    },
    statusColorFilter(val) {
      const map = {
        PROCESSING: 'warning',
        RETRING: 'warning',
        ASSOCIATING: 'warning',
        FAIL: 'danger',
        SUCCESS: 'success'
      }
      return map[val] || val
    },
    statusFilter(val) {
      const map = {
        PROCESSING: '处理中',
        RETRING: '重试中',
        ASSOCIATING: '关联资源中',
        FAIL: '失败',
        SUCCESS: '成功'
      }
      return map[val] || val
    }
  }
}
</script>
