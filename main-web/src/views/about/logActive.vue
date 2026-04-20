<template>
  <a-modal title="证书激活" v-model:visible="visible" @ok="ok" width="40%" :confirmLoading="loading">
    <a-form ref="formRef" :model="addData">
      <a-form-item label="激活码：" name="licenseMask" :rules="[required]" maxlength="2048">
        <a-textarea v-model:value="addData.licenseMask" :rows="15"></a-textarea>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { installCaptcha } from 'services/license'
import { required } from '@/validate'
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
// 单个传 sinple   多个 multiple
export default {
  setup() {
    const loading = ref(false)
    const formRef = ref()
    const addData = reactive({
      licenseMask: ''
    })
    const visible = ref(false)
    function open() {
      addData.licenseMask = ''
      visible.value = true
    }
    const router = useRouter()
    async function ok() {
      try {
        loading.value = true
        await formRef.value.validate()
        const data = await installCaptcha(addData)
        loading.value = false
        if (data.success) {
          message.success(data.message)
          visible.value = false
          router.replace('/login')
        }
      } catch (error) {
        loading.value = false
      }
    }
    return {
      required,
      loading,
      formRef,
      addData,
      visible,
      ok,
      open
    }
  }
}
</script>
