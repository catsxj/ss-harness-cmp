<template>
  <el-dialog title="证书激活" v-model="activeObject.visible" width="40%" v-if="activeObject.visible">
    <!-- TODO: cmp-element -->
    <basic-form ref="addDataRef" :model="addData">
      <basic-form-item label="激活码：" prop="licenseMask" validate="required" maxlength="2048">
        <el-input type="textarea" v-model="addData.licenseMask" :rows="15"></el-input>
      </basic-form-item>
    </basic-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="ghost" @click="activeObject.visible = false">取 消</el-button>
        <el-button type="primary" @click="ok()">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { installCaptcha } from 'services/system/license'

interface ActiveObject {
  type?: string
  visible?: boolean
}

interface AddData {
  licenseMask: string
}

const props = defineProps<{
  activeObject: ActiveObject
}>()

const emit = defineEmits<{
  getData: []
}>()

const route = useRoute()
const router = useRouter()

const addDataRef = ref()
const addData = reactive<AddData>({ licenseMask: '' })
const addFlag = ref(false)

function ok(): void {
  addDataRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (!addData.licenseMask) {
        ElMessage.error('请输入激活码')
        return false
      }
      installCaptcha(addData).then((data: any) => {
        if (data.success) {
          ElMessage({ type: 'success', message: data.message })
          emit('getData')
          props.activeObject.visible = false
          if (route.path === '/license') {
            router.replace('/login')
          }
        }
      })
    } else {
      return false
    }
  })
}

function success(response: any): void {
  const type = response.success ? 'success' : 'error'
  ElMessage({ type, message: response.message })
  emit('getData')
  props.activeObject.visible = false
}

function error(response: any): void {
  ElMessage({ type: 'error', message: response.message })
}

function before(file: File): boolean | void {
  const arr = file.name.split('.')
  if (['lic'].indexOf(arr[arr.length - 1]) == -1) {
    ElNotification({
      title: '提示',
      message: '请上传此类型的文件，【.lic】',
      type: 'error'
    })
    return false
  }
}

onMounted(() => {
  addData.licenseMask = ''
})

defineExpose({ success, error, before, addFlag })
</script>

<style></style>
