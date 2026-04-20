<template>
  <el-dialog title="批量审批" :visible.sync="configs.visible" width="40%" v-if="configs.visible">
    <el-form ref="data" :status-icon="true" label-width="80px">
      <!-- <el-alert :closable="false" type="error" class="m-b">部分工单在审批过程中需要填写必要信息，批量审批可能会导致工单执行结果失败。</el-alert> -->
      <el-form-item label="审批意见">
        <el-input v-model="remark"></el-input>
      </el-form-item>
      <el-form-item label="上传图片">
        <el-upload class="upload-demo" ref="upload" accept="image/*" :action="`/fms/v1/instances/nodes`" :multiple="true" :limit="10" :on-change="changeFile" list-type="picture-card" :file-list="fileList" :on-preview="handlePictureCardPreview" :auto-upload="false">
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
    </el-form>
    <el-dialog title="图片预览" :visible.sync="dialogVisible" append-to-body>
      <img :src="dialogImageUrl" alt="" />
    </el-dialog>
    <div slot="footer" class="dialog-footer">
      <el-button type="danger" @click="ok('nopass')">拒 绝</el-button>
      <el-button type="primary" @click="ok('pass')">通 过</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { allJugde } from 'services/services/flow'

export default {
  props: {
    configs: {
      type: Object
    }
  },
  data() {
    return {
      fileList: [],
      dialogVisible: false,
      dialogImageUrl: '',
      remark: ''
    }
  },
  methods: {
    initViewer(viewer) {
      this.$viewer = viewer
    },
    changeFile(file, fileList) {
      const isLt2M = file.size / 1024 / 1024 < 2
      if (isLt2M) {
        this.fileList = fileList
      } else {
        const index = fileList.length - 1
        fileList.splice(index, 1)
        return this.$message.error('上传图片大小不能超过 2MB!')
      }
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    ok(auditFlag) {
      const formData = new FormData()
      formData.append('instanceIds', JSON.stringify(this.configs.ids))
      formData.append('action', 'audit')
      formData.append('auditFlag', auditFlag)
      this.remark && formData.append('remark', this.remark)
      this.fileList.forEach(item => {
        formData.append('attachments', item.raw)
      })
      allJugde(formData).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.configs.visible = false
          this.$emit('getData')
        }
      })
    }
  }
}
</script>

<style></style>
