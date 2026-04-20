<template>
  <CardLayout title="消息接收角色设置">
    <el-transfer
      class="m-b"
      filterable
      :titles="['可选角色', '已选角色']"
      :props="{
        key: 'id',
        label: 'name'
      }"
      v-model="ids"
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
    roleIds: {
      type: Array,
      default: function () {
        return []
      }
    },
    flag: {
      type: Number
    }
  },
  data() {
    return {
      ids: [],
      list: []
    }
  },
  created() {
    this.getRoleList()
    this.ids = [...this.roleIds]
  },
  watch: {
    flag: {
      handler(newVal, oldVal) {
        this.ids = [...this.roleIds]
      }
    }
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
