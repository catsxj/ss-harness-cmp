<template>
  <el-dialog title="权限设置" width="600px" :close-on-click-modal="false" v-model="props.dialog.visible">
    <!-- TODO: cmp-element basic-form -->
    <basic-form>
      <basic-form-item label="流程自管：">
        <el-switch v-model="props.dialog.record.openFlow" active-text="开启" inactive-text="关闭" @change="handleSubmit('openFlow')" v-loading="loading"></el-switch>
      </basic-form-item>
      <basic-form-item label="软件安装：">
        <el-switch v-model="props.dialog.record.isInstallSoftware" active-text="开启" inactive-text="关闭" @change="handleSubmit('isInstallSoftware')" v-loading="loading"></el-switch>
      </basic-form-item>
      <basic-form-item label="付费模式：">
        <el-checkbox-group v-model="props.dialog.record.paymentMode" @change="handleSubmit('paymentMode')" v-loading="loading">
          <el-checkbox-button value="Hour">按量付费</el-checkbox-button>
          <el-checkbox-button value="Month">包年包月</el-checkbox-button>
        </el-checkbox-group>
      </basic-form-item>
    </basic-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { operateTenant, modifyTenant } from 'services/system/tenant'

interface PermissionDialogItem {
  visible: boolean
  record: any
}

const props = defineProps<{ dialog: PermissionDialogItem }>()
const emit = defineEmits<{ success: [] }>()

const loading = ref(false)

onMounted(() => {
  if (!Array.isArray(props.dialog.record.paymentMode)) props.dialog.record.paymentMode = []
})

function handleSubmit(type: string) {
  let request: Promise<any> | undefined
  if (type === 'openFlow') {
    request = operateTenant(props.dialog.record.id, props.dialog.record.openFlow ? 'openFlow' : 'closeFlow')
  } else if (type === 'isInstallSoftware') {
    request = operateTenant(props.dialog.record.id, props.dialog.record.isInstallSoftware ? 'openInstallSoftware' : 'closeInstallSoftware')
  } else if (type === 'paymentMode') {
    const res = JSON.parse(JSON.stringify(props.dialog.record))
    if (res.paymentMode.length === 0) {
      ElMessage.error('保存失败, 请至少选择一个付费模式')
      return
    }
    res.paymentMode = JSON.stringify(res.paymentMode)
    request = modifyTenant(res)
  }
  if (!request) return
  loading.value = true
  request
    .then((data: any) => {
      if (data.success) {
        ElMessage.success(data.message)
        emit('success')
      }
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
