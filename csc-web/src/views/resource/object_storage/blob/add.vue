<template>
  <div>
    <el-dialog title="上传" :visible.sync="addData.dialog" width="60%" :close-on-click-modal="false" append-to-body>
      <el-alert :closable="false" title="上传时刷新页面会中断文件上传。如果文件已存在，将会覆盖原文件。" type="warning"> </el-alert>
      <el-row class="m-t-md">
        <basic-form label-width="130px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="Blob类型：" prop="blobType" validate="required">
              <el-select v-model="addData.data.blobType">
                <el-option label="块 blob" value="BLOCK_BLOB"></el-option>
                <el-option label="页 blob" value="PAGE_BLOB"></el-option>
                <el-option label="附加 blob" value="APPEND_BLOB"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24" v-if="addData.data.blobType == 'BLOCK_BLOB' && addData.kind != 'Storage' && addData.sku.indexOf('Premium') == -1">
            <basic-form-item label="访问层：" prop="standardBlobTier" validate="required">
              <el-select v-model="addData.data.standardBlobTier">
                <el-option label="热（推断）" value="HOT"></el-option>
                <el-option label="冷" value="COOL"></el-option>
                <el-option label="存档" value="ARCHIVE"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <WsUploadFile ref="modelUpload" :needChinese="false"></WsUploadFile>
          </el-col>
        </basic-form>
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
import { createBlob } from 'services/platform/azure'
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
          if (this.$refs.modelUpload.file && this.$refs.modelUpload.uploadSuccess) {
            this.addData.data.filePath = this.$refs.modelUpload.file.filePath
          } else {
            return this.$message.error('请先上传文件！')
          }
          this.loading = true
          createBlob({ filePath: this.addData.data.filePath, containerId: this.addData.data.containerId, blobType: this.addData.data.blobType, standardBlobTier: this.addData.data.standardBlobTier }).then(data => {
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
  },
  created() {}
}
</script>

<style></style>
