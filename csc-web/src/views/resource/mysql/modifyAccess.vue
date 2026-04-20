<template>
  <div>
    <el-dialog title="修改公共访问级别" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="250px" :model="addData.data" ref="data">
          <basic-form-item label="是否允许访问此服务器的公共网络：">
            <el-switch v-model="addData.data.publicNetworkAccess"> </el-switch>
          </basic-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { putMysql } from 'services/platform/azure'
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
    return {
      loading: false
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          console.log(this.addData.data.publicNetworkAccess)
          this.loading = true
          putMysql('publicNetworkAccess', {
            id: this.addData.data.id,
            publicNetworkAccess: this.addData.data.publicNetworkAccess ? 'Enabled' : 'Disabled'
          }).then(data => {
            this.loading = false
            if (data.success) {
              this.$message.success(data.message)
              this.addData.dialog = false
            }
          })
        }
      })
    }
  }
}
</script>

<style></style>
