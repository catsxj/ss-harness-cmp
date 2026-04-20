<template>
  <el-dialog title="节点属性" :close-on-click-modal="false" :visible.sync="dialog.visible" width="900px">
    <basic-form ref="taskForm" :model="currentNode">
      <CardLayout title="节点设置">
        <el-row :gutter="10">
          <el-col :span="12">
            <basic-form-item validate="required" required-message="请输入节点名称" prop="label" label="节点名称：">
              <el-input v-model="currentNode.label"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12" v-if="currentNode.code === 'auditTask'" style="display: flex; gap: 10px">
            <basic-form-item label="自动审批：">
              <el-switch v-model="currentNode.autoExecute" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </basic-form-item>
            <basic-form-item label="调整配置：">
              <el-switch v-model="currentNode.isEditable" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </basic-form-item>
          </el-col>
        </el-row>
      </CardLayout>
      <div v-if="currentNode.code === 'auditTask'">
        <audit-user ref="auditUser" :assignee="currentNode.assignee"></audit-user>
        <audit-role ref="auditRole" :assigneeRole="currentNode.assigneeRole"></audit-role>
        <CardLayout title="控制台审批角色设置">
          <el-checkbox v-model="currentNode.assigneeTenantAdmin">租户管理员</el-checkbox>
          <el-checkbox v-model="currentNode.assigneeProjectManager">{{ $store.getters.systemConfig.projectConfigLabel }}经理</el-checkbox>
        </CardLayout>
        <CardLayout title="消息模板设置">
          <MessageTpl label="收到审批任务通知模板" :current-node="currentNode" value="msgTemplateReceive" :varList="varList" v-if="currentNode.code === 'auditTask'"></MessageTpl>
          <MessageTpl label="通过审批结果通知模板" :current-node="currentNode" value="msgTemplateApproved" :varList="varList"></MessageTpl>
          <MessageTpl label="拒绝审批结果通知模板" :current-node="currentNode" value="msgTemplateUnratified" :varList="varList"></MessageTpl>
        </CardLayout>
      </div>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="saveNode">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import AuditUser from './auditUser.vue'
import AuditRole from './auditRole.vue'
import MessageTpl from './messageTpl.vue'
import { commonVar } from './data'
import { getVar } from 'services/services/flow'

export default {
  components: {
    AuditUser,
    AuditRole,
    MessageTpl
  },
  props: {
    dialog: {
      type: Object
    },
    currentNode: {
      type: Object
    },
    applyType: {
      type: String
    }
  },
  data() {
    return {
      varList: []
    }
  },
  computed: {
    tags() {
      return [...commonVar, ...this.varList]
    }
  },
  created() {
    if (this.applyType) this.getVarList()
  },
  methods: {
    async getVarList() {
      const data = await getVar(this.applyType)
      if (data.success) {
        this.varList = data.data
      }
    },
    saveNode() {
      this.$refs.taskForm.validate((valid) => {
        if (valid) {
          if (this.currentNode.code === 'auditTask') {
            const assignee = this.$refs.auditUser.userIds
            const assigneeRole = this.$refs.auditRole.roleIds
            const { assigneeTenantAdmin, assigneeProjectManager } = this.currentNode
            if (!assignee.length && !assigneeRole.length && !assigneeTenantAdmin && !assigneeProjectManager) return this.$message.error('请确保审批人与审批角色不能全部为空')
            this.currentNode.assignee = assignee
            this.currentNode.assigneeRole = assigneeRole
          }
          this.dialog.visible = false
          this.$emit('save', this.currentNode)
        }
      })
    }
  }
}
</script>
