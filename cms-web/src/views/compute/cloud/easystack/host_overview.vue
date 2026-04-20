<template>
  <div>
    <el-card class="box-card">
      <detail-map :detail="detailData" :list="detailMapList"></detail-map>
      <el-row class="m-t">
        <el-col :span="15">
          <el-col :span="8" class="detail-progress">
            <div class="m-b">VCPU</div>
            <el-progress type="dashboard" :percentage="detailData.cpuUsage" :otherProps="{ color: '#61ADFD', type: 'dashboard' }"></el-progress>
          </el-col>
          <el-col :span="8" class="detail-progress">
            <div class="m-b">内存</div>
            <el-progress type="dashboard" :percentage="detailData.memUsage" color="#19BE6B"></el-progress>
          </el-col>
          <el-col :span="8" class="detail-progress">
            <div class="m-b">磁盘</div>
            <el-progress type="dashboard" :percentage="detailData.diskUsage" color="#5E55B1"></el-progress>
          </el-col>
        </el-col>
        <el-col :span="8" :offset="1" class="text_value">
          <div class="m-t-lg">
            <div class="icon1"></div>
            <div class="m-l-md display_box">VCPU已用/总计(C)</div>
            <div class="display_box_right">{{ detailData.cpuUsed }}/{{ detailData.cpuCapacity }}</div>
            <div style="clear: both"></div>
          </div>
          <div class="m-t-lg">
            <div class="icon2"></div>
            <div class="m-l-md display_box">内存已用/总计(GB)</div>
            <div class="display_box_right">{{ detailData.memUsed }}/{{ detailData.memoryCapacity }}</div>
            <div style="clear: both"></div>
          </div>
          <div class="m-t-lg">
            <div class="icon3"></div>
            <span class="m-l-md display_box">磁盘已用/总计(GB)</span>
            <div class="display_box_right">{{ detailData.diskUsed }}/{{ detailData.diskCapacity }}</div>
            <div style="clear: both"></div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-row :gutter="5">
      <el-col :span="12">
        <el-card class="box-card m-t-xs" style="height: 289px">
          <div slot="header" class="clearfix">
            <span>使用情况</span>
          </div>
          <div class="text-center">
            <el-col :span="12">
              <div>CPU利用率</div>
              <gauge-charts v-if="usageData.cpuUsage1" height="190px" id="cpuUsage" width="100%" :data="usageData.cpuUsage1"></gauge-charts>
            </el-col>
            <el-col :span="12">
              <div>内存利用率</div>
              <gauge-charts v-if="usageData.memUsage1" height="190px" id="memUsage" width="100%" :data="usageData.memUsage1"></gauge-charts>
            </el-col>
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
import chartBox from 'views/components/chartBox.vue'
import detailMap from 'views/components/detailMap.vue'
import { getCharts, getEasystackHost, getUsage } from 'services/monitor'
export default {
  components: { chartBox, detailMap },
  props: {
    detailId: {
      type: Number
    },
    vendorUuid: {
      type: String
    },
    detailIp: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '系统平均负载',
          value: 'first',
          expr: JSON.stringify(['node_load1{host_id="' + this.detailId + '"}', 'node_load5{host_id="' + this.detailId + '"}', 'node_load15{host_id="' + this.detailId + '"}']),
          name: '["1分钟", "5分钟", "15分钟"]',
          unit: ''
        },
        {
          title: '磁盘使用率',
          value: 'second',
          expr: JSON.stringify(['round(100 - node_filesystem_free_bytes / node_filesystem_size_bytes{host_id="' + this.detailId + '",fstype!~"rootfs|selinuxfs|autofs|rpc_pipefs|tmpfs|udev|none|devpts|sysfs|debugfs|fuse.*"} * 100,0.01)']),
          name: '["$device"]',
          unit: '%'
        },
        {
          title: '运行的云主机数量',
          value: 'runningVMs',
          expr: JSON.stringify(['bocloud_easystack_hypervisor_running_vms{host_ip="' + this.detailIp + '"}']),
          name: '["运行云主机数量"]',
          unit: '个'
        }
      ],
      detailMapList: [
        { name: 'IP', value: 'ip', unit: '' },
        { name: 'CPU', value: 'cpuCore', unit: 'C' },
        { name: '云主机', value: 'vmNum', unit: '个' },
        { name: 'VCPU超分比', value: 'cpuAllocationRate', unit: '' },
        { name: '内存超分比', value: 'memAllocationRate', unit: '' },
        { name: '磁盘超分比', value: 'diskAllocationRate', unit: '' }
      ],
      detailData: {},
      usageData: {},
      dashboradData: {
        first: {},
        second: {},
        runningVMs: {}
      },
      cpuUsageTimeInterval: '',
      memUsageTimeInterval: ''
    }
  },
  methods: {
    getOverview() {
      getEasystackHost(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          this.detailData.cpuUsage = Number(((this.detailData.cpuUsed * 100) / this.detailData.cpuCapacity).toFixed(2)) || 0
          this.detailData.memUsage = Number(((this.detailData.memUsed * 100) / this.detailData.memoryCapacity).toFixed(2)) || 0
          this.detailData.diskUsage = Number(((this.detailData.diskUsed * 100) / this.detailData.diskCapacity).toFixed(2)) || 0
        }
      })
    },
    getCpuUsage() {
      const expr = 'round((1 - avg(irate(node_cpu_seconds_total{host_id="' + this.detailId + '",mode="idle"}[5m])) by (host_id))*100,0.01)'
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
      const expr = 'round(100 - ((node_memory_MemFree_bytes+node_memory_Cached_bytes+node_memory_Buffers_bytes)/node_memory_MemTotal_bytes{host_id="' + this.detailId + '"}) * 100,0.01)'
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
    this.getOverview()
    this.getCpuUsage()
    this.getMemUsage()
  },
  beforeDestroy() {
    clearInterval(this.cpuUsageTimeInterval)
    clearInterval(this.memUsageTimeInterval)
  }
}
</script>
<style lang="scss" scoped>
.detail-progress {
  text-align: center;
  .stat-container {
    text-align: left;
    padding-left: 20px;
  }
}
.icon1 {
  float: left;
  background-color: #61adfd;
  border-radius: 50%;
  width: 20px;
  height: 20px;
}
.icon2 {
  float: left;
  background-color: #19be6b;
  border-radius: 50%;
  width: 20px;
  height: 20px;
}
.icon3 {
  float: left;
  background-color: #5e55b1;
  border-radius: 50%;
  width: 20px;
  height: 20px;
}
.text_value {
  font-weight: bold;
}
.display_box {
  float: left;
}
.display_box_right {
  float: right;
}
</style>
