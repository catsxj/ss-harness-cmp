<template>
  <el-dialog title="重置密码" v-model="props.dialog.visible" width="35%">
    <!-- TODO: cmp-element basic-form -->
    <basic-form :model="resetData" ref="fromRef">
      <basic-form-item label="登录密码：" prop="password" :validate="pwdRule">
        <el-input v-model="resetData.password" auto-complete="off" show-password></el-input>
      </basic-form-item>
    </basic-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="props.dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="resetSubmit" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import crypto from 'utils/crypto'
import { resetManager } from 'services/system/manager'
import { useAppStore } from '@/stores'

interface DialogItem {
  visible: boolean
  userId: number
}

const props = defineProps<{ dialog: DialogItem }>()

const appStore = useAppStore()
const resetData = ref<{ password: string }>({ password: '' })
const loading = ref(false)
const fromRef = ref<any>(null)

function resetSubmit() {
  fromRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const { password } = resetData.value
      const { userId } = props.dialog
      loading.value = true
      const res = await resetManager(userId, crypto.encrypt(password))
      loading.value = false
      if (res.success) {
        props.dialog.visible = false
        ElMessage.success(res.message)
      }
    }
  })
}

const pwdRule = computed(() => (appStore.systemConfig as any).pwdStrength + ',pswNoSpace')
</script>
