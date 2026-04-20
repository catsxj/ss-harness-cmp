<template>
  <ScreenWrapper title="/scr-web/static/img/business_network/title.png" :loading="loading">
    <el-row class="m-t-md">
      <el-col :span="8" class="left">
        <div class="card m-b">
          <div class="card-title">网络安全设备健康状态</div>
          <div class="card-body">
            <el-row :gutter="15">
              <el-col :span="8" v-for="(item, index) in healthCount" :key="index">
                <DeviceStatus :icon="`/scr-web/static/img/business_network/${item.name}.png`" :data="[{text: `通 ${item.onNum}`},{text: `断 ${item.offNum}`, color: '#F84540'}]"></DeviceStatus>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="card  m-b">
          <div class="card-title">网络设备内存利用率TOP10</div>
          <div class="card-body">
            <bar-reverse-charts :setting="{barColor: ['#24A0BB', '#18BD6E'], yAxisLabel: {rotate: 35}, showXAxis: false}" :data="memTop10" v-if="memTop10.keys" width="100%" height="100%">
            </bar-reverse-charts>
          </div>
        </div>
        <div class="card">
          <div class="card-title">网络设备CPU利用率TOP10</div>
          <div class="card-body">
            <bar-reverse-charts :setting="{barColor: ['#819190', '#F2980D'], yAxisLabel: {rotate: 35}, showXAxis: false}" :data="cpuTop10" v-if="cpuTop10.keys" width="100%" height="100%">
            </bar-reverse-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="8" class="center">
        <iframe src="/#/screen/network_iframe?name=教育网络拓扑" frameborder="0" class="iframe"></iframe>
      </el-col>
      <el-col :span="8" class="right">
        <div class="card  m-b">
          <div class="card-title">告警信息</div>
          <div class="card-body">
            <AlarmList :data="alarmList"></AlarmList>
          </div>
        </div>
        <div class="card  m-b">
          <div class="card-title">关注的网络设备</div>
          <div class="card-body">
            <NetworkTable :data="networkList"></NetworkTable>
          </div>
        </div>
        <div class="card">
          <div class="card-title">网络设备吞吐量TOP10</div>
          <div class="card-body">
            <bar-charts :setting="{linerColor: [['#1ABAF6', '#00F8FF']], showSeriesLabel: false, axisLabel: {rotate: 35}}" :data="portTop10" v-if="portTop10.keys" width="100%" height="100%">
            </bar-charts>
          </div>
        </div>
      </el-col>
    </el-row>
  </ScreenWrapper>
</template>
<script setup lang="ts">
import { reactive, toRefs, onUnmounted } from 'vue'
import ScreenWrapper from 'components/ScreenWrapper/index.vue'
import DeviceStatus from 'components/DeviceStatus/index.vue'
import AlarmList from './AlarmList.vue'
import NetworkTable from './NetworkTable/index.vue'
import {
  getHealthStatus,
  getMemTop10,
  getCpuTop10,
  getPortTop10,
  getNetworkDevice,
  getAlarmList
} from 'services/screen/business_network'

interface HealthItem {
  name: string
  onNum: number
  offNum: number
}

const state = reactive({
  healthCount: [] as HealthItem[],
  memTop10: {} as Record<string, unknown>,
  cpuTop10: {} as Record<string, unknown>,
  portTop10: {} as Record<string, unknown>,
  networkList: [] as Record<string, unknown>[],
  alarmList: [] as Record<string, unknown>[],
  loading: true
})

const { healthCount, memTop10, cpuTop10, portTop10, networkList, alarmList, loading } = toRefs(state)

const timer = setInterval(() => {
  change()
}, 1000 * 20)

onUnmounted(() => {
  clearInterval(timer)
})

// 健康状态
const getHealth = async () => {
  const res = await getHealthStatus()
  if (res.success) {
    state.healthCount = res.data
  }
}

// 内存top
const getMem = async () => {
  const res = await getMemTop10()
  if (res.success) {
    state.memTop10 = res.data
  }
}

// CPU top
const getCpu = async () => {
  const res = await getCpuTop10()
  if (res.success) {
    state.cpuTop10 = res.data
  }
}

// 端口 top
const getPort = async () => {
  const res = await getPortTop10()
  if (res.success) {
    state.portTop10 = res.data
  }
}

// 告警
const getAlarm = async () => {
  const res = await getAlarmList()
  if (res.success) {
    state.alarmList = res.data
  }
}

// 网络设备
const getNetwork = async () => {
  const res = await getNetworkDevice()
  if (res.success) {
    state.networkList = res.data
  }
}

const change = async () => {
  await Promise.all([
    getMem(),
    getCpu(),
    getPort(),
    getAlarm(),
    getNetwork(),
    getHealth(),
    getAlarm()
  ])
  state.loading = false
}
change()
</script>
<style lang="scss" scoped>
.left,
.right {
  width: 30%;
}
.center {
  width: 40%;
  background-size: 100%;
  height: calc(100vh - 80px);
}
.iframe{
  width: 100%;
  height: 100%;
}
.card {
  // height: calc((100vh - 170px) / 3 - 20px);
  height: 280px;
  .card-title {
    font-size: 18px;
    border-left: 3px solid #0089ff;
    font-weight: bold;
    color: #bbefff;
    padding-left: 5px;
    margin-bottom: 5px;
  }
  .card-body {
    height: calc(100% - 35px);
  }
}
</style>
