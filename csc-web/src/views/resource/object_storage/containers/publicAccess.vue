<template>
  <div>
    <el-dialog title="更新访问级别" :visible.sync="addData.dialog" width="40%" append-to-body>
      <el-row>
        <el-form label-width="130px" :model="addData.data" ref="data">
          <el-col :span="24">
            <el-form-item>
              <span slot="label">
                公共访问级别：
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">指定是否可公开访问容器中的数据。<br />默认情况下，容器数据专用于帐户所有者。<br />使用“Blob”允许对 blob 的公开读取访问。<br />使用“容器”允许对整个容器的公开读取和列表访问。</div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-select v-model="addData.data.publicAccessType">
                <el-option label="Blob" value="BLOB"></el-option>
                <el-option label="容器" value="CONTAINER"></el-option>
                <el-option label="专用" value="OFF"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
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
import { patchContainers, getAccount } from 'services/platform/azure'
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
    return {
      loading: false
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          patchContainers(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style></style>
