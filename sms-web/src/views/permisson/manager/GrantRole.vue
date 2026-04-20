<template>
  <el-dialog title="授权角色" :visible.sync="dialog.visible" width="35%">
    <basic-table :data="roleList" ref="roleTable" tooltip-effect="dark" @selection-change="handleSelectionChange">
      <el-table-column show-overflow-tooltip type="selection"> </el-table-column>
      <el-table-column show-overflow-tooltip label="角色名称" prop="name"> </el-table-column>
      <div slot="pagination"></div>
    </basic-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="grantSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Message } from 'element-ui'
import { defineComponent, ref, nextTick } from '@vue/composition-api'
import { getRolesByUser, accreditManager } from 'services/system/manager'

export default defineComponent({
  props: {
    dialog: {
      type: Object,
      required: true
    }
  },
  setup(props, context) {
    const roleList = ref([])
    const roleTable = ref(null)
    const getRoles = async () => {
      const res = await getRolesByUser(props.dialog.userId)
      if (res.success) {
        roleList.value = res.data
        await nextTick()
        roleList.value.forEach((item: any) => {
          if (item.checked) {
            ;(roleTable.value as any).toggleRowSelection(item)
          }
        })
      }
    }
    getRoles()
    const roleIds = ref([])
    function handleSelectionChange(selections: any) {
      roleIds.value = selections.map((item: any) => item.id)
    }
    const loading = ref(false)
    async function grantSubmit() {
      loading.value = true
      const res = await accreditManager(props.dialog.userId, roleIds.value)
      loading.value = false
      if (res.success) {
        Message.success(res.message)
        props.dialog.visible = false
      }
    }
    return {
      roleList,
      loading,
      roleTable,
      grantSubmit,
      handleSelectionChange
    }
  }
})
</script>
