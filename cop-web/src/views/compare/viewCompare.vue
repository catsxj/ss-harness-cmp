<template>
  <div>
    <AdvanceTable title="查看对比结果列表" :data="list" :searchConfigs="viewSearchConfigs" :params="params" :total="total" :columns="viewColumns" :get-list="getList" :loading="loading">
      <template #taskType="taskType">
        {{ taskType | taskTypeFilter }}
      </template>
      <template #mD5="val, record">
        <el-button type="text" @click="viewCompare(record)" v-if="val == 'false'"> 查看对比结果 </el-button>
        <span v-else>{{ val == 'true' ? '文件相同' : val == 'error' ? '获取文件异常' : '未知异常' }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="run(record)" v-if="record.runstatus == '3'" :disabled="['', null].includes(record.startTime)">
          <i class="el-icon-video-play"></i>
          开始
        </el-button>
        <el-button type="text" @click="stop(record)" v-else :disabled="['', null].includes(record.startTime)">
          <i class="el-icon-video-pause"></i>
          停止
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="del(record)" :disabled="!['0', '2', '3'].includes(record.runstatus)">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
      </template>
    </AdvanceTable>
    <el-dialog title="对比结果" :close-on-click-modal="false" v-if="dialogVisible" :visible.sync="dialogVisible" width="1000px" append-to-body>
      <div style="height: 30px">
        <div class="ddiv">
          <span class="divspan" :title="this.file1">本地标准文件：{{ this.file1 }}</span>
        </div>
        <div class="ddiv">
          <span class="divspan" :title="this.file2">主机文件：{{ this.file2 }}</span>
        </div>
      </div>
      <div id="mergely-resizer" style="height: 450px; margin-left: 10px">
        <div id="compare"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
// 引入mergely和codemirror包
import 'codemirror/lib/codemirror.js'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/lib/codemirror.css'
import 'mergely/lib/mergely.js'
import 'mergely/lib/mergely.css'
import { getFileList, getCompareTaskResult } from 'services/task/compare'
import { viewColumns, viewSearchConfigs } from './config'
import { Loading } from 'element-ui'
export default {
  props: {
    rData: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      viewColumns,
      viewSearchConfigs,
      loading: false,
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      dialogVisible: false,
      file1: '',
      file2: '',
      fileContent1: '',
      fileContent2: ''
    }
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        document.body.removeEventListener('dragover', this.handleDragOver)
        document.body.removeEventListener('drop', this.handleFileSelect)
      }
    }
  },
  methods: {
    viewCompare(row) {
      const replaceStr = /\\/gi
      const file1 = row.filePath1.replace(replaceStr, '\\\\')
      const file2 = row.filePath2.replace(replaceStr, '\\\\')
      this.file1 = file1
      this.file2 = file2
      this.fileContent1 = ''
      this.fileContent2 = ''
      this.dialogVisible = true
      this.$nextTick(() => {
        this.getCompareInfo()
      })
    },
    getFile(side) {
      const params = {
        fileName: this.file1
      }
      if (side == 'rhs') {
        params.fileName = this.file2
      }
      return getFileList(params).then((data) => {
        let handleData = data
        if (typeof handleData !== 'string') {
          handleData = JSON.stringify(data)
        }
        if (side == 'lhs') {
          this.fileContent1 = handleData
        } else {
          this.fileContent2 = handleData
        }
      })
    },
    getCompareInfo() {
      const that = this
      Promise.all([that.getFile('lhs'), that.getFile('rhs')])
        .then((res) => {
          $('#compare').mergely({
            width: 'auto',
            height: 'auto',
            cmsettings: { readOnly: false },
            lhs: function (setValue) {
              setValue(that.fileContent1)
            },
            rhs: function (setValue) {
              setValue(that.fileContent2)
            }
          })
          document.body.addEventListener('dragover', that.handleDragOver, false)
          document.body.addEventListener('drop', that.handleFileSelect, false)
        })
        .catch(() => {
          this.$notify({ messgae: '获取文件信息异常', type: 'error' })
        })
    },
    checkFileList(files) {
      if (typeof window.FileReader !== 'function') {
        this.$notify({
          message: "The file API isn't supported on this browser yet.",
          type: 'error'
        })
      }
      if (files.length > 0) {
        this.readFile(files[0], 'lhs')
      }
      if (files.length > 1) {
        this.readFile(files[1], 'rhs')
      }
    },
    readFile(file, side) {
      const that = this
      const reader = new FileReader()
      reader.onload = function file_onload() {
        if (side == 'lhs') {
          that.file1 = file.name
        } else {
          that.file2 = file.name
        }
        $('#compare').mergely(side, reader.result)
      }
      reader.readAsBinaryString(file)
    },
    handleDragOver(evt) {
      evt.stopPropagation()
      evt.preventDefault()
      evt.dataTransfer.dropEffect = 'copy'
    },
    handleFileSelect(evt) {
      evt.stopPropagation()
      evt.preventDefault()
      const files = evt.dataTransfer.files
      this.checkFileList(files)
    },
    getList() {
      getCompareTaskResult(this.params).then((data) => {
        this.list = data?.data?.rows || []
        this.total = data?.data?.total || 0
      })
    }
  },
  filters: {
    taskTypeFilter(val) {
      const compareList = { 8: '标准对比', 9: '跨机对比', 11: '历史对比' }
      return compareList[val] || '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.ddiv {
  width: 50%;
  float: left;
}
.divspan {
  padding: 0 20px;
  text-align: center;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
