<template>
  <el-dialog title="授权角色" v-model="props.dialog.visible" width="35%">
    <!-- TODO: cmp-element basic-table -->
    <basic-table :data="roleList" ref="roleTable" tooltip-effect="dark" @selection-change="handleSelectionChange">
      <el-table-column show-overflow-tooltip type="selection"> </el-table-column>
      <el-table-column show-overflow-tooltip label="角色名称" prop="name"> </el-table-column>
      <template #pagination><div></div></template>
    </basic-table>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="props.dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="grantSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRolesByUser, accreditManager } from 'services/system/manager'

interface DialogItem {
  visible: boolean
  userId: number
}

const props = defineProps<{ dialog: DialogItem }>()

const roleList = ref<any[]>([])
const roleTable = ref<any>(null)
const roleIds = ref<number[]>([])
const loading = ref(false)

async function getRoles() {
  const res = await getRolesByUser(props.dialog.userId)
  if (res.success) {
    roleList.value = res.data
    await nextTick()
    roleList.value.forEach((item: any) => {
      if (item.checked) {
        roleTable.value?.toggleRowSelection(item)
      }
    })
  }
}

onMounted(() => {
  getRoles()
})

function handleSelectionChange(selections: any[]) {
  roleIds.value = selections.map((item: any) => item.id)
}

async function grantSubmit() {
  loading.value = true
  const res = await accreditManager(props.dialog.userId, roleIds.value)
  loading.value = false
  if (res.success) {
    ElMessage.success(res.message)
    props.dialog.visible = false
  }
}
</script>
