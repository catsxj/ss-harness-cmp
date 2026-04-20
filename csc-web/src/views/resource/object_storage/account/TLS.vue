<template>
  <div>
    <el-dialog title="更改TLS版本" :visible.sync="addData.dialog" width="50%" v-if="addData.dialog">
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
          <el-col :span="24">
            <basic-form-item label="TLS 版本：" prop="minimumTlsVersion" validate="required">
              <el-select v-model="addData.data.minimumTlsVersion">
                <el-option label="1.0" value="TLS1_0"></el-option>
                <el-option label="1.1" value="TLS1_1"></el-option>
                <el-option label="1.2" value="TLS1_2"></el-option>
              </el-select>
            </basic-form-item>
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
import { putAccountTls } from 'services/platform/azure'
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
          putAccountTls(this.addData.data).then(data => {
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
