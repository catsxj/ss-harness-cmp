<template>
  <el-dialog title="配额设置" width="800px" :close-on-click-modal="false" v-model="props.dialog.visible">
    <quota-item :quota-data="quotaData" ref="quotaRef"></quota-item>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="props.dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="quotaSubmit" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import QuotaItem from './components/QuotaItem.vue'
import { createQuotaTenant, getQuotaTenant } from 'services/system/tenant'

interface QuotaDialogItem {
  visible: boolean
  id: number
}

const props = defineProps<{ dialog: QuotaDialogItem }>()

const loading = ref(false)
const quotaData = ref<any[]>([])
const quotaRef = ref<any>(null)

onMounted(() => {
  handleQuota()
})

function handleQuota() {
  getQuotaTenant(props.dialog.id, { params: JSON.stringify({ target: props.dialog.id, event: 'tenantQuotas' }) }).then((data: any) => {
    if (data.success) {
      quotaData.value = data.data
    }
  })
}

function quotaSubmit() {
  const resourceQuotas = quotaRef.value?.getPostData()
  loading.value = true
  createQuotaTenant(props.dialog.id, resourceQuotas)
    .then((data: any) => {
      if (data.success) {
        ElMessage.success(data.message)
        props.dialog.visible = false
      }
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
