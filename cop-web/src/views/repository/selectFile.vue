<template>
  <el-row :gutter="20">
    <el-col :span="24" v-if="isShowUploadFile || !file">
      <el-form-item label="选择文件:" class="m-b-sm">
        <div type="primary" class="el-button el-button--primary el-button--small pull-left upload-file-btn">
          <i class="el-icon-folder-add"></i>
          选择本地文件
          <div id="btnFileUpload" @click="selectLocal"><input type="file" name="file" /></div>
        </div>
        <el-button type="primary" size="small" class="pull-left" @click="selectFile">
          <i class="el-icon-cloudy"></i>
          选择服务器文件
        </el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24" v-if="localFileName">
      <el-form-item label="上传文件名:">
        <el-input v-model="localFileName" disabled style="width:70%;"></el-input>
        <el-button type="primary" :disabled="!isShowUploadFile" @click="checkSoft()">
          上传
        </el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24" v-if="!isShowUploadFile">
      <el-form-item label="上传进度:">
        <el-progress :percentage="file.progress"></el-progress>
      </el-form-item>
    </el-col>
    <el-col :span="24" v-if="showServerFileList">
      <el-form-item label="服务器文件:">
        <el-select clearable v-model="serverFileName" placeholder="服务器文件">
          <el-option v-for="(item, index) in list" :key="index" :label="item" :value="item"> </el-option>
        </el-select>
      </el-form-item>
    </el-col>
  </el-row>
</template>
<script>
/* global $ */
import { isoImage } from 'services/installhost'
import uploadFile from 'utils/uploadFile'
export default {
  props: {
    itemData: {
      type: Object
    },
    pageType: {
      type: String
    }
  },
  data() {
    return {
      list: null,
      localFileName: '',
      serverFileName: '',
      showServerFileList: false,
      isShowUploadFile: true,
      dialogServerVisible: false,
      file: null,
      uploadSuccess: false
    }
  },
  watch: {
    serverFileName: {
      handler() {
        if (this.pageType === 'software') {
          this.itemData.nfsPath = this.serverFileName
        }
      }
    },
    file: {
      handler() {
        if (this.pageType === 'software') {
          this.itemData.nfsPath = this.file.filePath
        }
      },
      deep: true
    }
  },
  mounted() {
    const self = this
    document.getElementById('btnFileUpload').addEventListener('change', function(event) {
      const file = event.target.files[0]
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
      self.localFileName = file.name
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
    // 上传
    checkSoft() {
      this.isShowUploadFile = false
      uploadFile(this.file, this.message, this.errorMessage)
    },
    message() {
      this.$message({
        message: '上传成功',
        type: 'success'
      })
      this.uploadSuccess = true
      this.isShowUploadFile = false
    },
    errorMessage() {
      this.$message({
        message: '空间不足，上传失败！',
        type: 'error'
      })
      this.uploadSuccess = false
    },
    selectFile() {
      this.localFileName = null
      this.isShowUploadFile = true
      this.getList()
      this.showServerFileList = true
    },
    selectLocal() {
      this.showServerFileList = false
    },
    getList() {
      isoImage().then(data => {
        if (data.success) {
          this.list = data.data
          if (this.list.length == 0) {
            this.$notify({
              message: '无服务器文件，请选择本地文件',
              type: 'error'
            })
          }
        }
      })
    },
    ok() {
      this.dialogServerVisible = false
    }
  }
}
</script>
