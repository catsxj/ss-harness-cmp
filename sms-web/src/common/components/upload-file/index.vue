<template>
  <div>
    <el-form-item :label="label" required>
      <input :id="id" type="file" name="file" v-if="isShowUploadFile" style="border: 1px solid #d8dce5; border-radius: 4px; padding: 5px 10px; width: 80%" />
      <el-button type="primary" v-if="isShowUploadFile" @click="submitUpload(file)">上传</el-button>
      <el-progress :percentage="file?.progress ?? 0" v-if="!isShowUploadFile"></el-progress>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import uploadFile from 'utils/uploadFile'

interface IFileInfo {
  file: File
  name: string
  isUploading: boolean
  isCancel: boolean
  isReady: boolean
  isSuccess: boolean
  progress: number
}

const props = withDefaults(
  defineProps<{
    fileType?: string
    id?: string
    label?: string
  }>(),
  {
    id: 'btnFileUpload',
    label: '文件上传：'
  }
)

const emit = defineEmits<{ show: [val: boolean] }>()

const file = ref<IFileInfo | null>(null)
const isShowUploadFile = ref(true)
const uploadSuccess = ref(false)

onMounted(() => {
  document.getElementById(props.id)?.addEventListener('change', (event: Event) => {
    const files = (event.target as HTMLInputElement).files
    if (!files || !files[0]) return
    const f = files[0]
    if (/[\u4e00-\u9fa5\s]/.test(f.name)) {
      ElMessage({
        message: '文件名不允许存在中文和空格',
        type: 'error'
      })
    }

    if (f.name.length > 64) {
      ElMessage({
        message: '文件名称过长',
        type: 'error'
      })
    }
    file.value = {
      file: f,
      name: f.name,
      isUploading: false,
      isCancel: false,
      isReady: false,
      isSuccess: false,
      progress: 0
    }
  })
})

const message = () => {
  ElMessage({
    message: '上传成功',
    type: 'success'
  })
  uploadSuccess.value = true
}

const submitUpload = (target: IFileInfo | null) => {
  if (target == undefined || target == null) {
    ElMessage.error('请选择上传文件')
    return
  }
  if (/[\u4e00-\u9fa5\s]/.test(target.name)) {
    ElMessage.error('文件名不允许存在中文和空格')
    return
  }
  if (props.fileType == 'EXCEL') {
    const fileName = target.name.split('.')
    const ext = fileName[fileName.length - 1]
    const validExts = ['xlsx', 'xls', 'xltx', 'xlt', 'xlsm', 'xlsb', 'xltm', 'csv']
    if (!validExts.includes(ext)) {
      ElMessage.error('请上传EXCEL表格')
      return
    }
  }
  isShowUploadFile.value = false
  emit('show', isShowUploadFile.value)
  uploadFile(target, message)
}
</script>
