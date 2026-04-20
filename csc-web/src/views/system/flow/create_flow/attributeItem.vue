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
          <el-col :span="12">
            <basic-form-item label="自动审批：">
              <el-switch v-model="currentNode.autoExecute" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </basic-form-item>
          </el-col>
        </el-row>
      </CardLayout>
      <div v-if="currentNode.code === 'auditTask'">
        <audit-user ref="auditUser" :assignee="currentNode.assignee"></audit-user>
        <CardLayout title="审批角色设置">
          <el-checkbox v-model="currentNode.assigneeTenantAdmin">租户管理员</el-checkbox>
          <el-checkbox v-model="currentNode.assigneeProjectManager">{{ $store.getters.systemConfig.projectConfigLabel }}经理</el-checkbox>
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
import AuditUser from './auditUser'

export default {
  components: {
    AuditUser
  },
  props: {
    dialog: {
      type: Object
    },
    currentNode: {
      type: Object
    }
  },
  data() {
    return {}
  },
  created() {},
  methods: {
    saveNode() {
      this.$refs.taskForm.validate(valid => {
        if (valid) {
          if (this.currentNode.code === 'auditTask') {
            const assignee = this.$refs.auditUser.userIds
            if (!assignee.length && !this.currentNode.assigneeTenantAdmin && !this.currentNode.assigneeProjectManager) return this.$message.error('请确保存在审批人')
            this.currentNode.assignee = assignee
            this.currentNode.assigneeRole = []
          }
          console.log(this.currentNode)
          this.dialog.visible = false
          this.$emit('save', this.currentNode)
        }
      })
    }
  }
}
</script>
