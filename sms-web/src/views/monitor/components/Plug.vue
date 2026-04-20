<template>
  <div>
    <el-row type="flex" :gutter="20" class="component-container">
      <el-col v-for="(item, key) in dataList" :key="key" :span="24" :class="colorMap[item.status]">
        <div class="cell">
          <div class="cell-title">{{ item.name }}</div>
          <div class="cell-body" v-for="(cell, idx) in item.instance" :key="idx" :title="cell.host" :style="{ 'border-color': borderColorMap[cell.status] }">
            <el-row class="row">
              <el-col :span="24">
                <span class="status">
                  <!-- TODO: cmp-element -->
                  <status-icon :type="statusFilter(cell.status, 'color')"></status-icon>
                </span>
                {{ cell.host }}
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- TODO: cmp-element -->
    <common-detail v-if="detailVisible" :setting="detailSetting" :title="(detailData as any).name" @goBack="goBack"> </common-detail>
    <!--实时日志-->
    <RealLog v-if="realLog.visible" :realLogData="realLog"></RealLog>
    <LogDownload v-if="logDownload.visible" :dialog="logDownload"></LogDownload>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import RealLog from './realLog.vue'
import LogDownload from './logDownload.vue'
import { getPlugs, getStatus } from 'services/system/service_system'
import { statusFilter, colorMap, borderColorMap } from './filters'

interface InstanceItem {
  host: string
  status: string
  [key: string]: unknown
}

interface PlugItem {
  name: string
  status: string
  instance: InstanceItem[]
}

const dataList = ref<PlugItem[] | ''>('')
const detailVisible = ref(false)
const detailSetting = reactive<{ type: string; columns: Array<Array<{ name: string; value: string }>> }>({
  type: 'host',
  columns: []
})
// TODO: type - 详情数据结构依赖后端
const detailData = ref<Record<string, unknown> | unknown[]>([])
const realLog = reactive<{ visible: boolean; data: Record<string, unknown> }>({ visible: false, data: {} })
const logDownload = reactive<{ visible: boolean; data?: Record<string, unknown> }>({ visible: false })

function getList(): void {
  getPlugs().then((data: any) => {
    if (data.success) {
      dataList.value = data.data
    }
  })
}

function download(item: InstanceItem): void {
  logDownload.visible = true
  logDownload.data = { ...item }
}

function getDetail(row: InstanceItem): void {
  detailSetting.columns = []
  getStatus({ value: row.host }).then((data: any) => {
    if (data.success) {
      detailData.value = data.data
      const array: Array<{ name: string; value: string }> = []
      for (const key in detailData.value as Record<string, unknown>) {
        array.push({ name: key, value: key })
      }
      detailSetting.columns.push(array)
      detailVisible.value = true
    }
  })
}

function goBack(): void {
  detailVisible.value = false
}

function handleRealLog(row: InstanceItem): void {
  realLog.visible = true
  realLog.data = row
}

onMounted(getList)

defineExpose({ getDetail, download, handleRealLog })
</script>

<style scoped lang="scss">
@import './index';
.component-container {
  .cell {
    display: flex;
    flex-wrap: wrap;
    min-height: 20px;
    margin-bottom: 10px;
    .cell-body {
      margin-right: 10px;
    }
  }
}
</style>
