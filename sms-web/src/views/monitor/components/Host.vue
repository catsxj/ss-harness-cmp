<template>
  <div>
    <el-row type="flex" :gutter="20" class="component-container">
      <el-col v-for="item in list" :key="item.host" :span="12" class="m-b-sm" :class="colorMap[item.status]">
        <div class="cell cur-point" @click="getDetail(item)">
          <div class="cell-title">{{ item.host }}</div>
          <el-row>
            <el-col :span="8">
              <!-- TODO: cmp-element -->
              <gauge-charts v-if="item.cpuUsed" height="200px" :id="`cpuUsage${item.host}`" width="100%" :data="{ min: 0, max: 100, data: { name: 'CPU利用率', value: item.cpuUsed } }"></gauge-charts>
            </el-col>
            <el-col :span="8">
              <!-- TODO: cmp-element -->
              <gauge-charts v-if="item.memUsed" height="200px" :id="`memUsage${item.host}`" width="100%" :data="{ min: 0, max: 100, data: { name: '内存利用率', value: item.memUsed } }"></gauge-charts>
            </el-col>
            <el-col :span="8">
              <!-- TODO: cmp-element -->
              <gauge-charts v-if="item.diskUsed" height="200px" :id="`disk${item.host}`" width="100%" :data="{ min: 0, max: 100, data: { name: '磁盘利用率', value: item.diskUsed } }"></gauge-charts>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
    <el-drawer v-if="detailVisible" title="主机详情" v-model="detailVisible" direction="rtl" class="host-detail" size="80%">
      <HostOverview :item="currentHost" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import HostOverview from './HostOverview.vue'
import { getServers } from 'services/system/service_system'
import { colorMap } from './filters'

// TODO: type - 主机项数据结构需要服务端对齐
interface HostItem {
  host: string
  status: string
  cpuUsed?: number
  memUsed?: number
  diskUsed?: number
  [key: string]: unknown
}

const timer = ref<number>(0)
const detailVisible = ref(false)
const currentHost = ref<HostItem | Record<string, unknown>>({})
const list = ref<HostItem[]>([])

function getList(): void {
  getServers().then((data: any) => {
    if (data.success) {
      list.value = data.data
    }
  })
}

function startInterval(): void {
  timer.value = window.setInterval(getList, 1000 * 60)
}

function getDetail(item: HostItem): void {
  detailVisible.value = true
  currentHost.value = item
}

onMounted(() => {
  getList()
  startInterval()
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style lang="scss" scoped>
@import './index';
.cell {
  min-height: 223px !important;
}
</style>
<style lang="scss">
.host-detail {
  .el-drawer__header {
    padding: 10px 0 10px 20px;
    margin-bottom: 0 !important;
  }
  .el-drawer__body {
    overflow-y: auto;
  }
}
</style>
