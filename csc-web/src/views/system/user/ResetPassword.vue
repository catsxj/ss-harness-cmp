<template>
  <el-dialog title="重置密码" :visible.sync="dialog.visible" width="35%">
    <basic-form :model="resetData" ref="fromRef">
      <basic-form-item label="登录密码：" prop="password" :validate="pwdRule">
        <el-input v-model="resetData.password" auto-complete="off" show-password></el-input>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="resetSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Message } from 'element-ui'
import { defineComponent, ref, computed } from '@vue/composition-api'
import crypto from 'utils/crypto'
import { resetManager } from 'services/system/manager'

export default defineComponent({
  props: {
    dialog: {
      type: Object,
      required: true
    }
  },
  setup(props, context) {
    const resetData = ref({
      password: ''
    })
    const loading = ref(false)
    function resetSubmit() {
      ;(context.refs.fromRef as HTMLFormElement).validate(async (valid: boolean) => {
        if (valid) {
          const { password } = resetData.value
          const {
            dialog,
            dialog: { userId }
          } = props
          loading.value = true
          const res = await resetManager(userId, crypto.encrypt(password))
          loading.value = false
          if (res.success) {
            dialog.visible = false
            Message.success(res.message)
          }
        }
      })
    }
    const pwdRule = computed(() => context.root.$store.getters.systemConfig.pwdStrength)
    return {
      resetData,
      loading,
      pwdRule,
      resetSubmit
    }
  }
})
</script>
