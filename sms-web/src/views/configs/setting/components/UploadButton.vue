<template>
  <el-button text @click="updateData" class="update-button" :loading="loading">更新</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { updateSystemConfigs } from 'services/system'
import { useAppStore } from '@/stores'

interface Props {
  data?: Record<string, unknown>
  codes?: string[]
  files?: string[]
  updateKey?: string
  validate?: () => boolean
}

const props = defineProps<Props>()

const loading = ref(false)
const appStore = useAppStore()

// TODO: i18n
const updateData = async () => {
  if (props.validate && !props.validate()) return
  const formData = new FormData()
  const { codes, files, data } = props
  const arr: { code: string; value: unknown }[] = []
  codes?.forEach((key) => {
    arr.push({
      code: key,
      value: data?.[key]
    })
  })
  formData.append('configs', JSON.stringify(arr))
  files &&
    files.forEach((key) => {
      // TODO: type - Element Plus upload file 对象
      const file = data?.[key] as any
      if (file) {
        formData.append(key, file.raw)
      }
    })
  loading.value = true
  const res = await updateSystemConfigs(formData)
  loading.value = false
  if (res.success) {
    ElMessage.success(res.message)
    if (props.updateKey === 'GetPageConfigs') {
      appStore.getPageConfigs()
    } else if (props.updateKey === 'GetSystemConfigs') {
      appStore.getSystemConfigs()
    }
  }
}
</script>
<style scoped>
.update-button {
  float: right;
  margin-top: 2px;
}
</style>
