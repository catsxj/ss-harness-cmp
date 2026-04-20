<template>
  <el-dialog title="权限设置" width="600px" :close-on-click-modal="false" :visible.sync="dialog.visible">
    <basic-form>
      <basic-form-item label="流程自管：">
        <el-switch v-model="dialog.record.openFlow" active-text="开启" inactive-text="关闭" @change="handleSubmit('openFlow')" v-loading="loading"></el-switch>
      </basic-form-item>
      <basic-form-item label="软件安装：">
        <el-switch v-model="dialog.record.isInstallSoftware" active-text="开启" inactive-text="关闭" @change="handleSubmit('isInstallSoftware')" v-loading="loading"></el-switch>
      </basic-form-item>
      <basic-form-item label="付费模式：">
        <el-checkbox-group v-model="dialog.record.paymentMode" @change="handleSubmit('paymentMode')" v-loading="loading">
          <el-checkbox-button label="Hour">按量付费</el-checkbox-button>
          <el-checkbox-button label="Month">包年包月</el-checkbox-button>
        </el-checkbox-group>
      </basic-form-item>
    </basic-form>
  </el-dialog>
</template>
<script>
import { operateTenant, modifyTenant } from 'services/system/tenant'
export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      loading: false
    }
  },
  created() {
    if (!Array.isArray(this.dialog.record.paymentMode)) this.dialog.record.paymentMode = []
  },
  methods: {
    handleSubmit(type) {
      let request
      if (type === 'openFlow') {
        request = operateTenant(this.dialog.record.id, this.dialog.record.openFlow ? 'openFlow' : 'closeFlow')
      } else if (type === 'isInstallSoftware') {
        request = operateTenant(this.dialog.record.id, this.dialog.record.isInstallSoftware ? 'openInstallSoftware' : 'closeInstallSoftware')
      } else if (type === 'paymentMode') {
        // 最少选择一个
        const res = JSON.parse(JSON.stringify(this.dialog.record))
        if (res.paymentMode.length === 0) {
          this.$message.error('保存失败, 请至少选择一个付费模式')
          return
        }
        res.paymentMode = JSON.stringify(res.paymentMode)
        request = modifyTenant(res)
      }
      this.loading = true
      request
        .then((data) => {
          if (data.success) {
            this.$message.success(data.message)
            this.$emit('success')
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
