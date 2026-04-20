<template>
  <div>
    <el-dialog append-to-body title="调整网络" width="30%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <el-form :model="addData.data" status-icon ref="data" label-width="120px" class="demo-ruleForm">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="目标宽带：" prop="band" validate="required" required-message="请输入大小">
              <el-input-number v-model="addData.data.band" :min="0" :max="100"></el-input-number>
              <span>Mbps</span>
            </basic-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { patchVmId } from 'services/platform/index'
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
    },
    vendorId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          patchVmId('setMaxBandwidth', this.addData.data).then(data => {
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

<style></style>
