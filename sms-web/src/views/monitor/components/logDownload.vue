<template>
  <el-dialog title="日志下载" :visible.sync="dialog.visible" width="40%" v-if="dialog.visible">
    <basic-form ref="timeData" :model="timeData">
      <el-form-item label="日志类型：">
        <el-radio-group v-model="downloadWay" @change="selectWay">
          <el-radio label="now">当日日志</el-radio>
          <el-radio label="old" :disabled="dialog.data.logger && dialog.data.logger.indexOf('worker') > -1">历史日志</el-radio>
        </el-radio-group>
      </el-form-item>
      <basic-form-item label="时间：" v-if="downloadWay === 'old'" prop="array" validate="required" required-message="请选择时间段">
        <el-date-picker v-model="timeData.array" type="daterange" format="yyyy-MM-dd" value-format="yyyy-MM-dd" range-separator="至" unlink-panels start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions"> </el-date-picker>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="dialog.visible = false">取 消</el-button>
      <el-button type="primary" @click="downloadOk()">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
/* global $ */
import { downloadFile } from 'utils'
export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      downloadWay: 'now',
      rule: {
        array: [{ required: true, message: '请选择时间段' }]
      },
      timeData: {
        array: []
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() >= Date.now()
        },
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  created() {
    const { data } = this.dialog
    const array = data.logger.split('.')
    this.timeData = {
      server: array[0],
      host: data.host,
      array: ''
    }
  },
  methods: {
    dates() {
      return true
    },
    selectWay() {
      this.timeData.array = ''
    },
    downloadOk() {
      this.$refs.timeData.validate((valid) => {
        if (valid) {
          if (this.downloadWay === 'now') {
            const params = {
              server: this.timeData.server,
              host: this.timeData.host
            }
            downloadFile('/sms/v1/logs/download', params)
          } else {
            const params = {
              server: this.timeData.server,
              host: this.timeData.host,
              begin: this.timeData.array[0],
              end: this.timeData.array[1]
            }
            downloadFile('/sms/v1/logs/zip', params)
          }
          this.dialog.visible = false
        } else {
          return false
        }
      })
    }
  }
}
</script>
