<template>
  <div>
    <el-row>
      <el-col :span="24">
        <detail-map :detail="detailData" :list="detailMapList"></detail-map>
      </el-col>
    </el-row>
    <el-row :gutter="5">
      <el-col :span="12">
        <el-card class="box-card m-t-xs">
          <div slot="header" class="clearfix">
            <span>使用情况</span>
          </div>
          <div class="text-center">
            <el-row :gutter="5">
              <el-col :span="12">
                <div>CPU利用率</div>
                <gauge-charts v-if="usageData.cpuUsage1" height="200px" id="cpuUsage" width="100%" :data="usageData.cpuUsage1"></gauge-charts>
              </el-col>
              <el-col :span="12">
                <div>内存利用率</div>
                <gauge-charts v-if="usageData.memUsage1" height="200px" id="memUsage" width="100%" :data="usageData.memUsage1"></gauge-charts>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { getNodeDetail } from 'services/monitor/kubernetes'
import chartBox from 'views/components/chartBox.vue'
import { getCharts, getUsage } from 'services/monitor'
import detailMap from 'views/components/detailMap.vue'
export default {
  components: { chartBox, detailMap },
  props: {
    detailName: {
      type: String
    },
    detailId: {
      type: Number
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '系统平均负载',
          value: 'first',
          expr: JSON.stringify(['node_load1{kubernetes_io_hostname="' + this.detailName + '"}', 'node_load5{kubernetes_io_hostname="' + this.detailName + '"}', 'node_load15{kubernetes_io_hostname="' + this.detailName + '"}']),
          name: "['1分钟', '5分钟', '15分钟']",
          unit: ''
        },
        {
          title: '磁盘使用率',
          value: 'second',
          expr: JSON.stringify(['round(100 - node_filesystem_free_bytes / node_filesystem_size_bytes{kubernetes_io_hostname="' + this.detailName + '",fstype!~"rootfs|selinuxfs|autofs|rpc_pnameefs|tmpfs|udev|none|devpts|sysfs|debugfs|fuse.*",mountpoint!~"/etc.*|/dev.*"} * 100,0.01)']),
          name: '["$device"]',
          unit: '%'
        },
        {
          title: '进程创建频率',
          value: 'third',
          expr: JSON.stringify(['round(irate(node_forks_total{kubernetes_io_hostname="' + this.detailName + '"}[5m]),0.01)']),
          name: '["进程创建频率"]',
          unit: '个/秒'
        }
      ],
      detailData: {},
      detailMapList: [
        { name: '名称', value: 'name', unit: '' },
        { name: 'ip', value: 'ip', unit: '' },
        { name: '容器组数量', value: 'podNum', unit: '个' },
        { name: 'Kubelet版本', value: 'version', unit: '' },
        { name: '操作系统类型', value: 'operatingSystem', unit: '' }
      ],
      usageData: {},
      cpuUsageTimeInterval: '',
      memUsageTimeInterval: '',
      dashboradData: {
        first: {},
        second: {},
        third: {}
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.cpuUsageTimeInterval)
    clearInterval(this.memUsageTimeInterval)
  },
  methods: {
    getDetail() {
      getNodeDetail({
        id: this.detailId
      }).then((data) => {
        if (data.success) {
          this.detailData = data.data
        }
      })
    },
    getCpuUsage() {
      const expr = 'round((1 - avg(irate(node_cpu_seconds_total{kubernetes_io_hostname="' + this.detailName + '",mode="idle"}[5m])) by (kubernetes_io_hostname))*100,0.01)'
      getUsage({
        expr: expr,
        simple: true
      }).then((data) => {
        if (data.success) {
          this.$set(this.usageData, 'cpuUsage1', {
            name: 'CPU利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
          if (this.cpuUsageTimeInterval) {
            clearInterval(this.cpuUsageTimeInterval)
            this.cpuUsageTimeInterval = ''
          }
          this.cpuUsageTimeInterval = setInterval(() => {
            this.getCpuUsage()
          }, 60 * 1000)
        }
      })
    },
    getMemUsage() {
      const expr = 'round(100 - ((node_memory_MemFree_bytes+node_memory_Cached_bytes+node_memory_Buffers_bytes)/node_memory_MemTotal_bytes{kubernetes_io_hostname="' + this.detailName + '"}) * 100,0.01)'
      getUsage({
        expr: expr,
        simple: true
      }).then((data) => {
        if (data.success) {
          this.$set(this.usageData, 'memUsage1', {
            name: '内存利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
          if (this.memUsageTimeInterval) {
            clearInterval(this.memUsageTimeInterval)
            this.memUsageTimeInterval = ''
          }
          this.memUsageTimeInterval = setInterval(() => {
            this.getMemUsage()
          }, 60 * 1000)
        }
      })
    }
  },
  created() {
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
    this.getDetail()
    this.getCpuUsage()
    this.getMemUsage()
  }
}
</script>
<style scoped>
.box-card .basic-info .attr-name {
  display: inline-block;
  white-space: nowrap;
  color: #999;
  width: 98px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.box-card .basic-info .attr {
  font-size: 12px;
  margin-bottom: 12px;
}
.rate_box {
  /*background: #425098;*/
  height: 290px;
  text-align: center;
  color: #fff;
  padding: 10px;
}
.rate_box .rate_box_top {
  background: #7c79b6;
  height: 160px;
}
.rate_box .rate_box_bottom {
  display: inline-block;
  width: calc((100% - 10px) / 2);
  background: #7170b6;
  margin-top: 10px;
  height: 120px;
}
.rate_box_top > div:nth-child(1) {
  height: 60px;
  line-height: 60px;
}
.rate_box_top > div:nth-child(2) {
  height: 70px;
  line-height: 70px;
  font-size: 32px;
}
.rate_box_bottom > div:nth-child(1) {
  height: 40px;
  line-height: 40px;
}
.rate_box_bottom > div:nth-child(2) {
  height: 50px;
  line-height: 50px;
  font-size: 22px;
}
</style>
