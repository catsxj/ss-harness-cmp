<template>
  <div class="inline">
    <div class="inline" @click="handleDelay()">
      <slot>
        <el-button type="text" :disabled="disabled || (data.expiredTime ? (data.expiredTime.indexOf('2099') > -1 ? true : false) : false)"> 延期</el-button>
      </slot>
    </div>
    <el-dialog title="延期" :close-on-click-modal="false" :visible.sync="dialogDelayVisible" v-if="dialogDelayVisible" width="400px" append-to-body>
      <basic-form :model="addData" ref="delayForm" label-width="130px">
        <basic-form-item label="延期时长(月)：" prop="months" validate="required,positiveInteger">
          <el-input-number v-model="addData.months" :min="1" :max="100" class="w-full"></el-input-number>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogDelayVisible = false">取消</el-button>
        <el-button type="primary" @click.native="delaySubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { delayService } from 'services/services/index'

export default {
  props: {
    data: {
      type: Object
    },
    resourceCategory: {
      type: String
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      dialogDelayVisible: false,
      addData: {}
    }
  },
  methods: {
    handleDelay() {
      if (this.disabled || (this.data.expiredTime ? this.data.expiredTime.indexOf('2099') > -1 : false)) return
      this.addData = {
        months: 1,
        resId: this.data.id,
        resourceCategory: this.resourceCategory
      }
      this.dialogDelayVisible = true
    },
    delaySubmit() {
      this.$refs.delayForm.validate(valid => {
        if (valid) {
          delayService(this.addData).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.$emit('getData')
              this.dialogDelayVisible = false
            }
          })
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
.inline {
  display: inline-block;
}
</style>
