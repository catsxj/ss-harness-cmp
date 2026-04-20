<template>
  <el-dialog title="成员配置" :visible.sync="dialog.visible" width="700px">
    <el-transfer
      filterable
      :titles="['可选成员', '已选成员']"
      :props="{
        key: 'id',
        label: 'name'
      }"
      v-model="userIds"
      :data="userList"
    >
    </el-transfer>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="dialog.visible = false">取 消</el-button>
      <el-button type="primary" @click="settingMember" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { settingProjectUser } from 'services/system/project'
import { getUser } from 'services/system/user'
import { getAccount } from 'services/system/account'

export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      userList: [],
      userIds: []
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    getUserList() {
      const deptId = this.dialog.deptId.concat(this.dialog.providerIds)
      getAccount({
        simple: true,
        condition: JSON.stringify({
          condition: 'listTenantUsers',
          deptId
        })
      }).then((data) => {
        if (data.success) {
          this.userList = data.data.rows
          // 应用系统经理处理
          for (const a of this.userList) {
            if (this.dialog.managerIds.indexOf(a.id) !== -1) {
              this.$set(a, 'disabled', true)
              a.name = `${a.name}-${this.$store.getters.systemConfig.projectConfigLabel}经理`
            }
            if (this.dialog.providerIds.indexOf(a.id) !== -1) {
              this.$set(a, 'disabled', true)
              a.name = `${a.name}-供应商经理`
            }
          }
          this.getProjectUser()
        }
      })
    },
    getProjectUser() {
      getUser({ condition: JSON.stringify({ condition: 'listProjectUser', projectId: this.dialog.projectId }) }).then((data) => {
        if (data.success) {
          data.data.forEach((item) => {
            this.userIds.push(item.id)
          })
        }
      })
    },
    settingMember() {
      // 设置成员时去除应用系统经理
      const userIds = [...this.userIds]
      for (let i = 0; i < this.dialog.managerIds.length; i++) {
        if (userIds.indexOf(this.dialog.managerIds[0]) !== -1) {
          userIds.splice(userIds.indexOf(this.dialog.managerIds[i]), 1)
        }
      }
      for (let i = 0; i < this.dialog.providerIds.length; i++) {
        if (userIds.indexOf(this.dialog.providerIds[0]) !== -1) {
          userIds.splice(userIds.indexOf(this.dialog.providerIds[i]), 1)
        }
      }
      this.loading = true
      settingProjectUser(this.dialog.projectId, {
        userIds
      })
        .then((data) => {
          if (data.success) {
            this.$message.success(data.message)
            this.dialog.visible = false
            this.$emit('getData')
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
