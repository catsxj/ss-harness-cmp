<template>
  <div>
    <el-dialog title="关闭" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <div>
        <basic-form ref="data" :model="addData.data" :status-icon="true">
          <basic-form-item label="问题单号：">
            {{ addData.orderSn }}
          </basic-form-item>
          <basic-form-item label="反馈说明：" prop="remark" validate="required" required-message="该字段为必填字段">
            <el-input type="textarea" v-model="addData.data.remark"></el-input>
          </basic-form-item>
          <basic-form-item label="服务评分：" prop="star" validate="required" required-message="该字段为必填字段">
            <el-rate v-model="addData.data.star"></el-rate>
          </basic-form-item>
        </basic-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { modifyworkOrder } from 'services/system/workorder'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.addData.data.status = 'closed'
          modifyworkOrder(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
          })
        }
      })
    }
  },
  created() {}
}
</script>

<style scoped>
.el-rate {
  line-height: 2 !important;
}
</style>
