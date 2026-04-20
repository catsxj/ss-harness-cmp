<template>
  <div>
    <el-form-item :label="label" required>
      <input :id="id" type="file" name="file" v-if="isShowUploadFile" style="border: 1px solid #d8dce5; border-radius: 4px; padding: 5px 10px; width: 80%" />
      <el-button type="primary" v-if="isShowUploadFile" @click="submitUpload(file)">上传</el-button>
      <el-progress :percentage="file.progress" v-if="!isShowUploadFile"></el-progress>
    </el-form-item>
  </div>
</template>

<script>
import uploadFile from 'utils/uploadFile'

export default {
  props: {
    fileType: {
      type: String
    },
    id: {
      type: String,
      default: 'btnFileUpload'
    },
    label: {
      type: String,
      default: '文件上传：'
    }
  },
  data() {
    return {
      file: null,
      isShowUploadFile: true,
      uploadSuccess: false
    }
  },
  created() {},
  mounted() {
    const self = this
    document.getElementById(this.id).addEventListener('change', function (event) {
      const files = event.target.files
      const file = files[0]
      if (/[\u4e00-\u9fa5\s]/.test(file.name)) {
        self.$message({
          message: '文件名不允许存在中文和空格',
          type: 'error'
        })
      }

      if (file.name.length > 64) {
        self.$message({
          message: '文件名称过长',
          type: 'error'
        })
      }
      self.file = {
        file: file,
        name: file.name,
        isUploading: false,
        isCancel: false,
        isReady: false,
        isSuccess: false,
        progress: 0
      }
    })
  },
  methods: {
    submitUpload(file) {
      if (file == undefined || file == null) {
        return this.$message.error('请选择上传文件')
      }
      if (/[\u4e00-\u9fa5\s]/.test(file.name)) {
        return this.$message.error('文件名不允许存在中文和空格')
      }
      if (this.fileType == 'EXCEL') {
        const fileName = file.name.split('.')
        let flag
        if (
          fileName[fileName.length - 1] === 'xlsx' ||
          fileName[fileName.length - 1] === 'xls' ||
          fileName[fileName.length - 1] === 'xltx' ||
          fileName[fileName.length - 1] === 'xlt' ||
          fileName[fileName.length - 1] === 'xlsm' ||
          fileName[fileName.length - 1] === 'xlsb' ||
          fileName[fileName.length - 1] === 'xltm' ||
          fileName[fileName.length - 1] === 'csv'
        ) {
          flag = true
        } else {
          return this.$message.error('请上传EXCEL表格')
        }
      }
      this.isShowUploadFile = false
      this.$emit('show', this.isShowUploadFile)
      uploadFile(file, this.message)
    },
    message(item) {
      this.$message({
        message: '上传成功',
        type: 'success'
      })
      this.uploadSuccess = true
    }
  }
}
</script>
