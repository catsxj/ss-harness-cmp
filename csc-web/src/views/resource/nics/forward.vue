<template>
  <div>
    <el-dialog title="IP转发设置" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
          <el-col :span="24">
            <cmp-form-item label="IP转发：" prop="ipForwarding" validate="required">
              <el-radio-group v-model="addData.data.ipForwarding">
                <el-radio :label="true">已启用</el-radio>
                <el-radio :label="false">已禁用</el-radio>
              </el-radio-group>
            </cmp-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { putNicsIpForward } from 'services/platform/azure'
/* global $ */
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {},
          dialog: false
        }
      }
    }
  },
  data() {
    return {}
  },
  created() {},
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          putNicsIpForward(this.addData.data).then(data => {
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
  }
}
</script>

<style></style>
