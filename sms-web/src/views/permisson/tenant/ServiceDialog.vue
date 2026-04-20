<template>
  <el-dialog title="服务授权" width="800px" :close-on-click-modal="false" v-model="props.dialog.visible">
    <ServiceGrant :no-configs="true" :tenant-id="props.dialog.id" :tenant-quota="props.dialog.quotaAble" ref="serviceRef"></ServiceGrant>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="props.dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="save" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ServiceGrant from './components/ServiceItem.vue'
import { authsAllTenant } from 'services/services/catelog'

interface ServiceDialogItem {
  visible: boolean
  id: number
  quotaAble: boolean
}

const props = defineProps<{ dialog: ServiceDialogItem }>()
const emit = defineEmits<{ serviceSuccess: [] }>()

const loading = ref(false)
const serviceRef = ref<any>(null)

function save() {
  const selections: any[] = serviceRef.value?.selections || []
  for (const element of selections) {
    if (element.quota == 0) {
      ElMessage.error('选中服务配额不能为0')
      return
    }
  }
  const services = serviceRef.value?.getPostData()
  loading.value = true
  authsAllTenant(props.dialog.id, { ...services })
    .then((data: any) => {
      if (data.success) {
        ElMessage.success(data.message)
        props.dialog.visible = false
        emit('serviceSuccess')
      }
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
