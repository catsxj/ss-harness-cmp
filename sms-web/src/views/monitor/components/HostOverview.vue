<template>
  <el-card>
    <el-row :gutter="20">
      <el-col :span="8" class="attr">
        <span class="attr-name">IP地址：</span>
        <span class="attr-value">{{ item.host }}</span>
      </el-col>
      <el-col :span="8" class="attr">
        <span class="attr-name">主机状态：</span>
        <span class="attr-value">
          <!-- TODO: cmp-element -->
          <status-icon :type="statusFilter(item.status, 'color')">{{ statusFilter(item.status) }}</status-icon>
        </span>
      </el-col>
      <el-col :span="8">
        <el-button-group>
          <el-button size="small" :type="item.value === step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value)">{{ item.name }}</el-button>
          <el-button size="small" :type="step === 0 ? 'primary' : ''" @click="handleUserDefind()">自定义</el-button>
        </el-button-group>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card m-t">
          <template #header>
            <div class="clearfix">
              <span>使用情况</span>
            </div>
          </template>
          <div class="text-center">
            <el-row :gutter="20">
              <el-col :span="12">
                <!-- TODO: cmp-element -->
                <gauge-charts v-if="item.cpuUsed" height="200px" id="cpuUsage" width="100%" :data="{ min: 0, max: 100, data: { name: 'CPU利用率', value: item.cpuUsed } }"></gauge-charts>
              </el-col>
              <el-col :span="12">
                <!-- TODO: cmp-element -->
                <gauge-charts v-if="item.memUsed" height="200px" id="memUsage" width="100%" :data="{ min: 0, max: 100, data: { name: '内存利用率', value: item.memUsed } }"></gauge-charts>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card m-t">
          <template #header>
            <div class="clearfix">
              <span>使用情况</span>
            </div>
          </template>
          <div class="text-center">
            <el-row :gutter="20">
              <el-col :span="24">
                <!-- TODO: cmp-element -->
                <gauge-charts v-if="item.diskUsed" height="200px" id="diskUsage" width="100%" :data="{ min: 0, max: 100, data: { name: '磁盘利用率', value: item.diskUsed } }"></gauge-charts>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card m-t">
          <template #header>
            <div class="clearfix">
              <span>CPU利用率</span>
            </div>
          </template>
          <div>
            <!-- TODO: cmp-element -->
            <line-charts ref="cpuUsageChartRef" height="220px" width="100%" id="cpuUsageChart" :data="detailData.cpu" :unit="detailData.cpu.unit" v-if="detailData.cpu"></line-charts>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card m-t">
          <template #header>
            <div class="clearfix">
              <span>内存利用率</span>
            </div>
          </template>
          <div>
            <!-- TODO: cmp-element -->
            <line-charts ref="memUsageChartRef" height="200px" width="100%" id="memUsageChart" :data="detailData.mem" :unit="detailData.mem.unit" v-if="detailData.mem"></line-charts>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card m-t">
          <template #header>
            <div class="clearfix">
              <span>磁盘利用率</span>
            </div>
          </template>
          <div>
            <!-- TODO: cmp-element -->
            <line-charts ref="diskUsageChartRef" height="200px" width="100%" id="diskUsageChart" :data="detailData.disk" :unit="detailData.disk.unit" v-if="detailData.disk"></line-charts>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card m-t">
          <template #header>
            <div class="clearfix">
              <span>网络使用速率</span>
            </div>
          </template>
          <div>
            <!-- TODO: cmp-element -->
            <line-charts ref="netUsageChartRef" height="200px" width="100%" id="netUsageChart" :data="detailData.network" :unit="detailData.network.unit" v-if="detailData.network"></line-charts>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <userDefind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="defindTime" @getData="getOverviewChart"></userDefind>
  </el-card>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import userDefind from './userDefind.vue'
import { getServersDetail } from 'services/system/service_system'
import { statusFilter } from './filters'

interface HostItem {
  host: string
  status: string
  [key: string]: unknown
}

interface ChartSeries {
  unit?: string
  [key: string]: unknown
}

interface DetailData {
  cpu?: ChartSeries
  mem?: ChartSeries
  disk?: ChartSeries
  network?: ChartSeries
}

interface IntervalItem {
  name: string
  value: string
}

const intervalData: IntervalItem[] = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]

const props = defineProps<{
  item: HostItem
}>()

const step = ref<string | number>('1H')
const detailData = ref<DetailData>({})
const defindTime = ref<number[]>([])
const userDefindVisible = ref(false)
const timer = ref<number>(0)
// TODO: type - getDetail 查询参数尚未明确
const paramsCache = ref<Record<string, unknown>>({})

function clearTimer(): void {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = 0
  }
}

function getDetail(p: Record<string, unknown> = paramsCache.value): void {
  paramsCache.value = p
  getServersDetail({ ...p, ip: props.item.host }).then((data: any) => {
    if (data.success) {
      detailData.value = data.data
    }
  })
}

function setTimer(): void {
  clearTimer()
  timer.value = window.setInterval(() => {
    getDetail()
  }, 1000 * 20)
}

function changeInterval(value: string): void {
  step.value = value
  const end = Math.round(new Date().getTime() / 1000)
  let duration = 0
  let stepVal = 0
  switch (value) {
    case '1H':
      duration = 3600
      break
    case '6H':
      duration = 6 * 3600
      break
    case '1D':
      duration = 24 * 3600
      break
    case '7D':
      duration = 7 * 24 * 3600
      break
    case '14D':
      duration = 14 * 24 * 3600
      break
    default:
      break
  }
  const start = end - duration
  if (value) {
    stepVal = duration / 180 - ((duration / 180) % 20)
    getDetail({ start, end, step: stepVal })
  }
  setTimer()
}

function handleUserDefind(): void {
  userDefindVisible.value = true
}

function getOverviewChart(value?: number[]): void {
  userDefindVisible.value = false
  if (value) {
    step.value = 0
    const start = Math.round(value[0] / 1000)
    const end = Math.round(value[1] / 1000)
    const duration = end - start
    const stepVal = duration / 180 - ((duration / 180) % 20)
    getDetail({ start, end, step: stepVal })
    defindTime.value = value
  }
}

onMounted(() => {
  changeInterval('1H')
})

onBeforeUnmount(clearTimer)
</script>

<style scoped>
.attr-value {
  display: inline-block;
}
</style>
