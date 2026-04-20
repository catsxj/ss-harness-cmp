<template>
  <el-card class="wrapper">
    <div>
      <div slot="header" class="clearfix">
        <div class="detail-header">
          <span class="detail-back" @click="goVcenterBack"><i class="iconfont icon-left-arrow"></i> 返回</span>
          <span class="line"></span>
          <span class="title">{{ $route.query.name }}</span>
        </div>
      </div>
      <el-tabs ref="monitorList" v-model="activeName" type="border-card">
        <el-tab-pane label="当前告警" name="current">
          <current-monitor v-if="activeName == 'current'" :target="target" :typeName="type" ref="currentMonitor"></current-monitor>
        </el-tab-pane>
        <el-tab-pane label="历史告警" name="history">
          <history-monitor v-if="activeName == 'history'" :target="target" :typeName="type" ref="historyMonitor"></history-monitor>
        </el-tab-pane>
      </el-tabs>
      <el-row class="m-t" :gutter="20">
        <el-col :span="10">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>当前告警统计</span>
            </div>
            <pie-charts ref="chart1" v-if="chart1Data" id="chart1" :data="chart1Data" width="100%" :setting="{ color: ['#EC1C24', '#FF7F27', '#FFF200', '#4EAFF5'] }" theme="当前告警统计" height="250px"></pie-charts>
          </el-card>
        </el-col>
        <el-col :span="14">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>告警统计</span>
              <span class="pull-right">
                <el-button-group>
                  <el-button size="mini" :type="item.value == chart2.step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value)">{{ item.name }}</el-button>
                  <el-button size="mini" :type="chart2.step === 0 ? 'primary' : ''" @click="userDefind()">自定义</el-button>
                </el-button-group>
              </span>
            </div>
            <div>
              <bar-charts ref="chart2" height="250px" width="100%" id="cpu" :data="chart2Data" :setting="{ color: ['#EC1C24', '#FF7F27', '#FFF200', '#4EAFF5'] }" v-if="chart2Data"></bar-charts>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-dialog title="自定义时间" :close-on-click-modal="false" v-if="userDefindVisible" :visible.sync="userDefindVisible">
        <basic-form>
          <basic-form-item label="选择时间：">
            <el-date-picker v-model="userDefindTime2" type="datetimerange" size="mini" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerOptions"></el-date-picker>
          </basic-form-item>
        </basic-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="ghost" @click.native="close">取消</el-button>
          <el-button type="primary" @click.native="userDefindSubmit">确定</el-button>
        </div>
      </el-dialog>
    </div>
  </el-card>
</template>

<script>
import currentMonitor from './currentMonitor.vue'
import historyMonitor from './historyMonitor.vue'
import { getAlarmPieChart, getAlarmBarChart } from 'services/monitor'
const intervalData = [
  { name: '7D', value: '7' },
  { name: '15D', value: '15' },
  { name: '1M', value: '30' }
]
export default {
  components: {
    currentMonitor,
    historyMonitor
  },
  data() {
    return {
      intervalData,
      target: Number(this.$route.query.id),
      type: this.$route.query.type,
      activeName: 'current',
      chart1Data: null,
      chart2Data: null,
      chart2: {
        step: null
      },
      userDefindTime: [],
      userDefindTime2: [],
      userDefindVisible: false,
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() > Date.now() - 8.64e6
        }
      }
    }
  },
  created() {
    this.getPieData()
    this.changeInterval(7)
  },
  beforeDestroy() {},
  methods: {
    getPieData() {
      getAlarmPieChart({
        target: this.target,
        type: this.type
      }).then(data => {
        if (data.success) {
          this.chart1Data = data.data
        }
      })
    },
    getBarData() {
      getAlarmBarChart({
        target: this.target,
        type: this.type,
        start: this.chart2.start,
        end: this.chart2.end
      }).then(data => {
        if (data.success) {
          this.chart2Data = data.data
        }
      })
    },
    // 改变周期
    changeInterval(value) {
      this.userDefindTime = []
      this.userDefindTime2 = []
      this.chart2.step = value
      // 获取当天 0 点的时间戳
      const timeStamp = new Date(new Date().setHours(0, 0, 0, 0)) / 1000
      this.chart2.end = timeStamp
      // 一天是86400秒   故 value 天前的时间戳为
      this.chart2.start = timeStamp - 86400 * value
      this.getBarData()
    },
    userDefind() {
      this.userDefindTime2 = Object.assign([], this.userDefindTime)
      this.userDefindVisible = true
    },
    userDefindSubmit() {
      this.userDefindTime = Object.assign([], this.userDefindTime2)
      if (this.userDefindTime.length) {
        this.chart2.step = 0
        this.chart2.end = Math.round(this.userDefindTime[1] / 1000)
        this.chart2.start = Math.round(this.userDefindTime[0] / 1000)
        this.getBarData()
        this.userDefindVisible = false
      } else {
        return this.$message.error('请选择自定义时间！')
      }
    },
    close() {
      this.userDefindVisible = false
    },
    goVcenterBack() {
      history.go(-1)
    }
  }
}
</script>
<style scoped>
.detail-header {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}
.detail-header .detail-back {
  color: #46abf1;
  cursor: pointer;
}
.detail-header .line {
  position: relative;
  top: 4px;
  margin: 0 6px;
  height: 14px;
  width: 1px;
  display: inline-block;
  background-color: #b5b5b5;
}

.detail_icon {
  font-size: 25px;
  margin: 10px;
  color: #409eff;
}
</style>
