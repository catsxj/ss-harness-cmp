<template>
  <ScreenWrapper code="RESOURCE_SCREEN" :loading="loading">
    <OverviewState :configs="overviewConfigs"></OverviewState>
    <el-row class="m-t-md" :gutter="10">
      <el-col :span="8" class="left">
        <div class="card">
          <div class="card-title">云资源统计</div>
          <div class="card-body">
            <el-row :gutter="15" class="resource-count">
              <el-col :span="12">
                <ResourceCount title="云主机总数(台)" :value="resourceCount.serverNum" color=""></ResourceCount>
              </el-col>
              <el-col :span="12">
                <ResourceCount title="CPU总量(核)" :value="resourceCount.cpu" color="#18BE6A" icon="/scr-web/static/img/sip/cpu.png"></ResourceCount>
              </el-col>
              <el-col :span="12">
                <ResourceCount title="内存总量(GB)" :value="resourceCount.mem" color="#1890FF" icon="/scr-web/static/img/sip/mem.png"></ResourceCount>
              </el-col>
              <el-col :span="12">
                <ResourceCount title="存储总量(TB)" :value="resourceCount.disk" color="#FF6600" icon="/scr-web/static/img/sip/storage.png"></ResourceCount>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="card">
          <div class="card-title">云主机状态统计</div>
          <div class="card-body">
            <bar-charts height="100%" width="100%" :data="hostCount"></bar-charts>
          </div>
        </div>
        <div class="card h-300">
          <div class="card-title">告警统计</div>
          <div class="card-body">
            <pie-charts :data="alarmCount" width="100%" height="240px" unit="" :configs="{color: ['#EC1C24', '#FF7F27', '#FFF200', '#4EAFF5']}"></pie-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="8" class="center">
        <PlatformCard @changePlatform="change"></PlatformCard>
        <div class="card h-300">
          <div class="card-title">云主机资源申请趋势</div>
          <div class="card-body">
            <line-charts :data="applyTrendData" v-if="applyTrendData.keys" width="100%" height="240px"></line-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="8" class="right">
        <div class="card">
          <div class="card-title">云主机CPU资源使用TOP5</div>
          <div class="card-body">
            <bar-reverse-charts height="100%" width="100%" :data="cpuTop5"></bar-reverse-charts>
          </div>
        </div>
        <div class="card">
          <div class="card-title">云主机内存资源使用TOP5</div>
          <div class="card-body">
            <bar-reverse-charts height="100%" width="100%" :data="memTop5"></bar-reverse-charts>
          </div>
        </div>
        <div class="card h-300">
          <div class="card-title">云资源使用趋势</div>
          <div class="card-body">
            <line-charts :data="usedTrendData" v-if="usedTrendData.keys" width="100%" height="240px"></line-charts>
          </div>
        </div>
      </el-col>
    </el-row>
  </ScreenWrapper>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'
import ScreenWrapper from 'components/ScreenWrapper/index.vue'
import OverviewState from 'components/OverviewState/index.vue'
import PlatformCard from './PlatformCard.vue'
import ResourceCount from '../count_screen/ResourceCount.vue'
import { overviewConfigs } from './data'
import {
  getOverview,
  getPlatformOverview,
  getUsed,
  getPlatforms,
  getAlarmPieChart,
  getResourceApply,
  getResourceTrend,
  getResTops,
  getHostStatus,
  getResourceCount
} from 'services/screen/resource'

const state = reactive({
  overviewConfigs,
  alarmCount: [] as Record<string, unknown>[],
  resourceCount: {} as Record<string, unknown>,
  cpuTop5: {} as Record<string, unknown>,
  memTop5: {} as Record<string, unknown>,
  hostCount: {} as Record<string, unknown>,
  applyTrendData: {} as Record<string, unknown>,
  usedTrendData: {} as Record<string, unknown>,
  vendorType: '',
  loading: true
})

const {
  overviewConfigs: _oc, alarmCount, resourceCount, cpuTop5, memTop5,
  hostCount, applyTrendData, usedTrendData, loading
} = toRefs(state)

// 总体情况
const getOverviewState = async () => {
  const res = await getOverview()
  if (res.success) {
    const { hosts, servers, running } = res.data
    const unit = state.overviewConfigs[0]
    ;[hosts, servers, running].forEach((item: number, index: number) => {
      unit.data[index].value = item
    })
  }
}

// 平台情况
const getPlatformState = async () => {
  const res = await getPlatformOverview()
  if (res.success) {
    const { pubNum, priNum } = res.data
    const unit = state.overviewConfigs[1]
    ;[priNum, pubNum].forEach((item: number, index: number) => {
      unit.data[index].value = item
    })
  }
}

// 使用情况
const getUsedState = async () => {
  const res = await getUsed()
  if (res.success) {
    const {
      menUnused,
      memTotal,
      cpuUnused,
      cpuTotal,
      diskTotal,
      diskUnused
    } = res.data
    const unit = state.overviewConfigs[2]
    ;[
      { used: cpuUnused, total: cpuTotal },
      { used: menUnused, total: memTotal },
      { used: diskUnused, total: diskTotal }
    ].forEach((item, index) => {
      unit.data[index].used = item.used
      unit.data[index].total = item.total
    })
  }
}

// 云资源统计
const getResource = async () => {
  const res = await getResourceCount(state.vendorType)
  if (res.success) {
    state.resourceCount = res.data
  }
}

// 云主机状态
const getHostCount = async () => {
  const res = await getHostStatus(state.vendorType)
  if (res.success) {
    state.hostCount = res.data
  }
}

// 告警统计
const getAlarmCount = async () => {
  const res = await getAlarmPieChart()
  if (res.success) {
    state.alarmCount = res.data
  }
}

// 申请趋势
const getApplyCount = async () => {
  const res = await getResourceApply(state.vendorType)
  if (res.success) {
    state.applyTrendData = res.data
  }
}

// 使用趋势
const getUsedCount = async () => {
  const res = await getResourceTrend(state.vendorType)
  if (res.success) {
    state.usedTrendData = res.data
  }
}

// cputop5
async function getCpuTop5() {
  const res = await getResTops({
    vendorType: state.vendorType,
    type: 'vmCpu',
    limit: 5
  })
  if (res.success) {
    state.cpuTop5 = res.data
  }
}

// mem top5
async function getMemTop5() {
  const res = await getResTops({
    vendorType: state.vendorType,
    type: 'vmMem',
    limit: 5
  })
  if (res.success) {
    state.memTop5 = res.data
  }
}

// 切换平台
const change = async (type: string) => {
  state.vendorType = type
  const proArr = [
    getApplyCount(),
    getUsedCount(),
    getCpuTop5(),
    getMemTop5(),
    getHostCount(),
    getResource()
  ]
  await Promise.all(proArr)
}

const init = async () => {
  try {
    await Promise.all([
      getOverviewState(),
      getUsedState(),
      getPlatformState(),
      getAlarmCount(),
      change('')
    ])
  } catch (error) { /* ignore */ }
  state.loading = false
}
init()
</script>
<style lang="scss" scoped>
.left,
.right {
  width: 27%;
}
.center {
  width: 46%;
}
.h-300 {
  height: 300px !important;
}
.card {
  height: 240px;
  overflow: hidden;
  margin-bottom: 10px;
  .card-title {
    font-size: 18px;
    border-left: 3px solid #0089ff;
    font-weight: bold;
    color: #bbefff;
    padding-left: 5px;
    margin-bottom: 6px;
  }
  .card-body {
    height: calc(100% - 30px);
  }
}
.resource-count :deep(.cell){
  height: 85px;
}
</style>
