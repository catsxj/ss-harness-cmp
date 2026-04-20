<template>
  <el-card class="chart-card">
    <div slot="header" class="chart-header">
      <div>{{ title }}</div>
      <div class="operate">
        <el-radio-group v-model="timeType" @change="selectTime" size="mini">
          <el-radio-button v-for="item in timeList" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
        </el-radio-group>
        <el-button class="m-l-sm" size="mini" :type="timeType === '' ? 'primary' : 'ghost'" @click="selectTime()">自定义</el-button>
        <el-dropdown class="m-l-sm">
          <span class="el-dropdown-link">
            <i class="el-icon-setting" style="font-size: 16px"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="enlarge">放大</el-dropdown-item>
            <el-dropdown-item @click.native="download">下载</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dialog title="时间选择" :visible.sync="dialogVisible" width="500px" v-if="dialogVisible" append-to-body="">
          <el-date-picker v-model="time" value-format="timestamp" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right"> </el-date-picker>
          <div slot="footer" class="dialog-footer">
            <el-button @click.native="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click.native="submit">确定</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
    <slot></slot>
    <component ref="charts" :is="defaultChart" :setting="chartSetting" :data="data" :unit="transformUnit ? '' : data.unit" :theme="title" :id="chartId" :height="height" width="100%" v-if="data"></component>
    <el-dialog :title="title" :visible.sync="enlargeDialogVisible" v-if="enlargeDialogVisible" fullscreen class="chart-dialog" append-to-body>
      <component ref="charts" :is="defaultChart" :setting="chartSetting" :data="data" :unit="transformUnit ? '' : data.unit" :theme="title" :id="`${chartId}dialog`" height="100%" width="100%" v-if="data"></component>
    </el-dialog>
  </el-card>
</template>
<script>
import { downloadFile } from '../rich-chart/tools'
import { transformKb } from './tools'
import { getCharts } from 'services/monitor'
export default {
  props: {
    title: {
      type: String
    },
    defaultChart: {
      type: String,
      default: 'line-charts'
    },
    timeList: {
      type: Array,
      default: function () {
        return [
          { label: '1H', value: 3600 },
          { label: '6H', value: 3600 * 6 },
          { label: '1D', value: 3600 * 24 },
          { label: '7D', value: 3600 * 24 * 7 },
          { label: '14D', value: 3600 * 24 * 14 }
        ]
      }
    },
    setting: {
      type: Object,
      default: function () {
        return {}
      }
    },
    params: {
      type: Object,
      default: function () {
        return {}
      }
    },
    height: {
      type: String,
      default: '220px'
    },
    interval: {
      type: Number,
      default: 60
    },
    transformUnit: {
      type: String
    }
  },
  data() {
    return {
      chartId: Math.random().toString(),
      pickerMinDate: '',
      pickerOptions: {
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
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ],
        onPick: ({ maxDate, minDate }) => {
          this.pickerMinDate = minDate.getTime()
          if (maxDate) {
            this.pickerMinDate = ''
          }
        },
        disabledDate: (time) => {
          if (this.pickerMinDate !== '') {
            const day14 = (14 - 1) * 24 * 3600 * 1000
            let maxTime = this.pickerMinDate + day14
            const minTime = this.pickerMinDate - day14
            if (maxTime > new Date()) {
              maxTime = new Date()
            }
            return time.getTime() > maxTime || time.getTime() < minTime
          }
          return time.getTime() > Date.now()
        }
      },
      data: '',
      enlargeDialogVisible: false,
      dialogVisible: false,
      timeType: 3600,
      time: '',
      timerInterval: 0,
      timeParams: {
        step: '',
        start: '',
        end: ''
      }
    }
  },
  computed: {
    // 图标设置
    chartSetting() {
      let setting = {}
      if (this.transformUnit) {
        const map = {
          KB: transformKb
        }
        const formatter = map[this.transformUnit]
        setting = {
          axisLabel: {
            formatter: (value) => formatter(value)
          },
          tooltip: {
            formatter: function (params) {
              return params
                .map((item, index) => {
                  const { name, seriesName, value, marker } = item
                  return `${index === 0 ? name : ''}<br/>${marker}${seriesName}：${formatter(value, 2)}`
                })
                .join('\n')
            }
          }
        }
      }
      return {
        ...setting,
        ...this.setting
      }
    }
  },
  created() {
    this.selectTime(this.timeType)
    this.startTimer()
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    startTimer() {
      this.clearTimer()
      this.timerInterval = setInterval(() => {
        this.getData()
      }, this.interval * 1000)
    },
    async getData() {
      const data = await getCharts({
        ...this.params,
        ...this.timeParams
      })
      if (data.success) {
        this.data = data.data
      }
    },
    selectTime(value) {
      // 自定义
      if (!value) {
        this.dialogVisible = true
        return
      }
      const end = Math.round(new Date().getTime() / 1000)
      const start = end - value
      this.getTimeData(start, end)
    },
    submit() {
      if (!this.time) return this.$message.error('请选择时间范围')
      const [startTime, endTime] = this.time
      this.timeType = ''
      this.dialogVisible = false
      this.getTimeData(Math.round(startTime / 1000), Math.round(endTime / 1000))
    },
    getTimeData(startTime, endTime) {
      this.timeParams.start = startTime
      this.timeParams.end = endTime
      const duration = this.timeParams.end - this.timeParams.start
      this.timeParams.step = duration / 180 - ((duration / 180) % 20)
      this.getData()
    },
    clearTimer() {
      clearInterval(this.timerInterval)
    },
    enlarge() {
      this.enlargeDialogVisible = true
    },
    download() {
      const image = this.$refs.charts.chart.getDataURL()
      downloadFile(this.title, image)
    }
  }
}
</script>
<style scoped lang="scss">
.chart-card {
  margin-top: 10px;
  .chart-header {
    display: flex;
    align-items: center;
  }
  .operate {
    flex: 1;
    text-align: right;
    ::v-deep .el-radio-button--mini .el-radio-button__inner {
      padding: 4px 15px;
    }
  }
  ::v-deep .el-card__body {
    padding: 10px !important;
  }
}
.chart-dialog {
  ::v-deep .el-dialog__body {
    height: calc(100vh - 130px);
  }
}
</style>
