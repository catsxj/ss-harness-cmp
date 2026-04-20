<template>
  <CardLayout title="管理端审批角色设置">
    <el-transfer
      filterable
      :titles="['可选角色', '已选角色']"
      :props="{
        key: 'id',
        label: 'name'
      }"
      v-model="roleIds"
      :data="list"
    >
      <span slot-scope="{ option }">{{ option.name }}</span>
    </el-transfer>
  </CardLayout>
</template>
<script>
import { getRole } from 'services/system/role'

export default {
  props: {
    assigneeRole: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      roleIds: [],
      list: []
    }
  },
  created() {
    this.getRoleList()
    this.roleIds = [...this.assigneeRole]
  },
  methods: {
    async getRoleList() {
      const data = await getRole({
        page: 1,
        rows: 10000
      })
      if (data.success) {
        this.list = data.data.rows
      }
    }
  }
}
</script>
<style></style>
