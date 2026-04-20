<template>
  <el-dialog width="40%" :visible.sync="immediateDialog.visible" :title="immediateDialog.title">
    <basic-form :model="immediateDialog.formData" ref="formRef">
      <basic-form-item label="账期：" prop="month" validate="required">
        <el-date-picker type="month" multiple v-model="immediateDialog.formData.month" placeholder="选择一个或多个月" value-format="yyyy-MM"> </el-date-picker>
      </basic-form-item>
    </basic-form>
    <template #footer>
      <el-button type="default" @click="handleCancle">取消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { patchConfiguration } from '@/services/services/bill'

export default {
  props: {
    immediateDialog: { type: Object }
  },
  data() {
    return {
      loading: false
    }
  },
  created() {},
  methods: {
    handleCancle() {
      this.$refs.formRef.resetFields()
      this.immediateDialog.visible = false
    },
    confirm() {
      this.$refs.formRef.validate((validate) => {
        if (!validate) return
        this.loading = true
        this.immediateDialog.formData.month = this.immediateDialog.formData.month.split(',')
        patchConfiguration(this.immediateDialog.formData, this.immediateDialog.data)
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message)
              this.handleCancle()
              this.$emit('getList')
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    }
  }
}
</script>
