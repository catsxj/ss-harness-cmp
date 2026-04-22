<template>
  <div>
    <el-dialog title="分配资源池" v-model="props.addData.dialog" width="700px">
      <el-row>
        <el-transfer filterable v-model="props.addData.data.poolIds" :data="list" :titles="['未选择', '已选择']">
          <template #default="{ option }">
            <span :title="option.label">{{ option.label }}</span>
          </template>
        </el-transfer>
      </el-row>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="props.addData.dialog = false">取 消</el-button>
          <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPoolConditions } from 'services/platform/pool'
import { getTenantPool, assignTenantPools } from 'services/system/tenant'

interface AssignPoolItem {
  dialog: boolean
  data: {
    id?: number
    labelIds?: number[]
    poolIds?: number[]
    [key: string]: any
  }
  loading?: boolean
}

const props = defineProps<{ addData: AssignPoolItem }>()
const emit = defineEmits<{ back: [] }>()

const list = ref<Array<{ key: number; label: string }>>([])
const loading = ref(false)

function ok() {
  loading.value = true
  assignTenantPools(props.addData.data).then((data: any) => {
    if (data.success) {
      loading.value = false
      ElMessage.success(data.message)
      props.addData.dialog = false
      emit('back')
    }
  })
}

onMounted(() => {
  getPoolConditions({
    page: 1,
    rows: 9999,
    condition: JSON.stringify({ condition: 'listAssignGroups', tenantId: props.addData.data.id })
  }).then((data: any) => {
    data.data.forEach((item: any) => {
      list.value.push({ key: item.id, label: item.name })
    })
  })
  getTenantPool(props.addData.data.id as number).then((data: any) => {
    props.addData.data.poolIds = []
    data.data.forEach((item: any) => {
      props.addData.data.poolIds!.push(item.poolGroupId)
    })
  })
})
</script>

<style></style>
