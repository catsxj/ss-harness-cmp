<template>
  <div>
    <el-row type="flex" :gutter="20" class="component-container">
      <el-col v-for="(item, key) in (data as any).service" :key="key" :span="modelMap[(data as any).hosts] || 12" :class="colorMap[item.status]">
        <div class="cell">
          <div class="cell-title">{{ item.name }}</div>
          <div class="cell-body" :class="cell.status !== 'running' && 'disabled'" v-for="(cell, idx) in item.instance" :key="idx" @click="getDetail(cell)" :style="{ 'border-color': borderColorMap[cell.status] }">
            <el-row class="row" :gutter="10">
              <el-dropdown class="setting">
                <span class="el-dropdown-link">
                  <el-icon><Setting /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click.stop="handleRealLog(cell)">实时日志</el-dropdown-item>
                    <el-dropdown-item @click.stop="download(cell)">日志下载</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-col :span="24" class="m-b-sm">
                <span class="status">
                  <!-- TODO: cmp-element -->
                  <status-icon :type="statusFilter(cell.status, 'color')"></status-icon>
                </span>
                <span class="progress-wrap" :title="cell.host">{{ cell.host }}</span>
              </el-col>
              <el-col :span="24" class="m-b-sm">
                <span class="status">CPU：</span>
                <span class="progress-wrap">
                  <el-progress :percentage="cell.cpuUsed / 1"></el-progress>
                </span>
              </el-col>
              <el-col :span="24" class="m-b-sm">
                <span class="status">内存：</span>
                <span class="progress-wrap">
                  <el-progress :percentage="cell.memUsed / 1"></el-progress>
                </span>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- TODO: cmp-element -->
    <common-detail-right v-if="detailVisible" title="服务详情" @goBack="goBack">
      <template #item_container>
        <!-- TODO: cmp-element -->
        <common-detail-item :label="item.name" v-for="item in detailData" :key="item.name">{{ item.value }}</common-detail-item>
      </template>
    </common-detail-right>
    <!--实时日志-->
    <RealLog v-if="realLog.visible" :realLogData="realLog"></RealLog>
    <LogDownload v-if="logDownload.visible" :dialog="logDownload"></LogDownload>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import RealLog from './realLog.vue'
import LogDownload from './logDownload.vue'
import { getServices, getStatus } from 'services/system/service_system'
import { statusFilter, colorMap, borderColorMap } from './filters'

interface ServiceInstance {
  host: string
  status: string
  cpuUsed?: number
  memUsed?: number
  [key: string]: unknown
}

interface ServiceItem {
  name: string
  status: string
  instance: ServiceInstance[]
}

interface ServiceData {
  service?: ServiceItem[]
  hosts?: number
  [key: string]: unknown
}

const modelMap: Record<number, number> = {
  6: 12,
  3: 12,
  1: 6
}

const data = ref<ServiceData | ''>('')
const detailVisible = ref(false)
const detailData = ref<Array<{ name: string; value: unknown }>>([])
const realLog = reactive<{ visible: boolean; data: Record<string, unknown> }>({ visible: false, data: {} })
const logDownload = reactive<{ visible: boolean; data?: Record<string, unknown> }>({ visible: false })

function getList(): void {
  getServices().then((res: any) => {
    if (res.success) {
      data.value = res.data
    }
  })
}

function download(item: ServiceInstance): void {
  logDownload.visible = true
  logDownload.data = { ...item }
}

function getDetail(row: ServiceInstance): void {
  if (row.status !== 'running') {
    return
  }
  detailVisible.value = true
  getStatus({ value: row.host }).then((res: any) => {
    if (res.success) {
      const array: Array<{ name: string; value: unknown }> = []
      for (const key in res.data) {
        array.push({ name: key, value: res.data[key] })
      }
      detailData.value = array
    }
  })
}

function goBack(): void {
  detailVisible.value = false
}

function handleRealLog(row: ServiceInstance): void {
  realLog.visible = true
  realLog.data = row
}

onMounted(getList)
</script>

<style scoped lang="scss">
@import './index';
.cell {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
  .cell-body {
    margin-right: 10px;
    max-height: 110px;
    &.disabled {
      cursor: default;
    }
    span.status {
      display: inline-block;
      position: relative;
      top: -1.5px !important;
    }
  }
}
</style>
