<template>
  <el-card class="chart-card">
    <div slot="header" class="chart-header">
      <div>{{ title }}</div>
      <div class="operate">
        <el-radio-group v-model="chartType" size="mini" class="m-r-sm">
          <template v-if="defaultChart === 'loop-charts'">
            <el-radio-button label="loop-charts">环状</el-radio-button>
            <el-radio-button label="bar-charts">柱状</el-radio-button>
          </template>
          <template v-else>
            <el-radio-button label="line-charts">折线</el-radio-button>
            <el-radio-button label="bar-charts">柱状</el-radio-button>
          </template>
        </el-radio-group>
        <el-button type="ghost" class="operate-btn" @click="enlarge">放大</el-button>
        <!-- <el-button type="ghost" class="operate-btn" @click="download">下载</el-button> -->
      </div>
    </div>
    <slot></slot>
    <component ref="charts" :is="chartMap[chartType]" :setting="chartSetting" :data="getResData()" v-if="data" :theme="title" :id="chartId" :height="height" width="100%"></component>
    <el-dialog :title="title" :visible.sync="dialogVisible" v-if="dialogVisible" fullscreen class="chart-dialog">
      <component :is="chartMap[chartType]" :setting="chartSetting" :data="getResData()" :theme="title" :id="`${chartId}dialog`" height="100%" width="100%"></component>
    </el-dialog>
  </el-card>
</template>
<script>
import { downloadFile } from './tools'
export default {
  props: {
    title: {
      type: String
    },
    defaultChart: {
      type: String,
      default: 'loop-charts'
    },
    data: {
      type: [Object, Array]
    },
    setting: {
      type: Object,
      default: function () {
        return {}
      }
    },
    height: {
      type: String,
      default: '260px'
    },
    // 图片下载配置
    downloadOpt: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      chartId: Math.random().toString(),
      chartType: '',
      dialogVisible: false,
      chartMap: {
        'pie-charts': 'pie-charts',
        'bar-charts': 'bar-charts',
        'line-charts': 'line-charts',
        'loop-charts': 'pie-charts'
      }
    }
  },
  computed: {
    chartSetting() {
      const setting = {}
      if (this.chartType === 'pie-charts') setting.radius = '75%'
      return {
        ...this.setting,
        ...setting
      }
    }
  },
  created() {
    this.chartType = this.defaultChart
  },
  methods: {
    // 处理环状图切换为柱状图
    getResData() {
      if (this.defaultChart === 'loop-charts' && this.chartType === 'bar-charts') {
        const keys = []
        const values = [
          {
            name: '统计数据',
            data: []
          }
        ]
        this.data.forEach(item => {
          const { name, value } = item
          keys.push(name)
          values[0].data.push(value)
        })
        return {
          keys,
          values
        }
      }
      return this.data
    },
    enlarge() {
      this.dialogVisible = true
    },
    download() {
      const image = this.$refs.charts.chart.getDataURL(this.downloadOpt)
      downloadFile(this.downloadOpt.name || this.title, image)
    }
  }
}
</script>
<style scoped lang="scss">
.chart-card {
  .chart-header {
    display: flex;
    align-items: center;
  }
  .operate {
    flex: 1;
    text-align: right;
    .operate-btn {
      padding: 7px 15px;
    }
  }
  ::v-deep .el-card__body {
    padding: 10px !important;
  }
  .chart-dialog {
    ::v-deep .el-dialog__body {
      height: calc(100vh - 130px);
    }
  }
}
</style>
