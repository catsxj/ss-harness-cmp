<template>
  <common-detail @goBack="goBack" :title="detail.name">
    <div slot="custom_content">
      <AdvanceTable title="标准对比列表" :data="list" :searchConfigs="standardFileSearchConfigs" :params="params" :total="total" :columns="standardFileColumns" :get-list="getList" :loading="loading">
        <template #action>
          <el-button icon="el-plus" type="primary" @click="handleUpload()">上传标准文件</el-button>
        </template>
        <template #operate="val, record">
          <el-button type="text" @click="del(record)"> 删除 </el-button>
        </template>
      </AdvanceTable>
      <el-dialog title="请选择文件" :close-on-click-modal="false" v-if="dialogVisible" :visible.sync="dialogVisible" width="500px" append-to-body>
        <basic-form :model="data" ref="form">
          <basic-form-item label="文件" prop="file" validate="required" required-message="请选择文件">
            <el-input placeholder="请选择文件" v-model="importFile" readonly style="width: 80%; margin-right: 10px" />
            <el-button type="primary" @click="$refs.selectFile.click()">浏览</el-button>
          </basic-form-item>
        </basic-form>
        <input type="file" v-show="false" ref="selectFile" @change="handleImportFileChange" />
        <div slot="footer" class="dialog-footer">
          <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click.native="upload" :loading="loading">提交</el-button>
        </div>
      </el-dialog>
    </div>
  </common-detail>
</template>

<script>
// import moment from 'moment'
import { removeStandardFile, getStandardFileList, uploadStandardFileList } from 'services/task/compare'
import { standardFileColumns, standardFileSearchConfigs } from './config'
export default {
  data() {
    return {
      standardFileColumns,
      standardFileSearchConfigs,
      loading: false,
      detail: {
        name: '标准文件管理'
      },
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10,
        sidx: '',
        sord: 'asc'
      },
      data: {
        file: ''
      },
      dialogVisible: false
    }
  },
  computed: {
    importFile() {
      const data = this.data.file
      if (data) {
        return data.name
      }
      return ''
    }
  },
  methods: {
    handleUpload() {
      this.data.file = ''
      this.loading = false
      this.dialogVisible = true
    },
    handleImportFileChange(event) {
      if (!event.target.files || !event.target.files.length) {
        return
      }
      const file = event.target.files[0]
      const param = file.name

      const endWith1 = /.tar$/,
        endWith2 = /.tar.gz$/,
        endWith3 = /.gz$/,
        endWith4 = /.tar.bz2$/,
        endWith5 = /.tar.Z$/,
        endWith6 = /.zip$/,
        endWithWar = /.war$/,
        iso = /.iso$/,
        exec = /.exe$/

      if (iso.test(param) || exec.test(param) || endWithWar.test(param) || endWith6.test(param) || endWith1.test(param) || endWith2.test(param) || endWith3.test(param) || endWith4.test(param) || endWith5.test(param)) {
        this.$notify({ message: '只能上传标准文件', type: 'error' })
        return
      }
      this.data.file = event.target.files[0]
      event.target.value = null
    },
    upload() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          const formData = new FormData()
          formData.append('textfield_choose', this.data.file.name)
          formData.append('file', this.data.file)
          uploadStandardFileList(formData).then((data) => {
            const res = data.data
            if (data.success) {
              this.$notify({ message: data.message, type: 'success' })
              this.dialogVisible = false
              this.handleSearch()
            }
            this.loading = false
          })
        }
      })
    },
    goBack() {
      this.$emit('goBack')
    },
    del(row) {
      this.$confirm('您确定要删除当前数据吗?', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeStandardFile({
          id: row.id,
          fileName: row.fileName
        }).then((data) => {
          if (data.success) {
            this.$notify({ message: '删除成功', type: 'success' })
            this.getList()
          }
        })
      })
    },
    getList() {
      getStandardFileList(this.params).then((data) => {
        this.list = data?.data?.rows || []
        this.total = data?.data?.total || 0
      })
    }
  }
}
</script>
