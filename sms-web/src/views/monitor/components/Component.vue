<template>
  <div>
    <el-row type="flex" :gutter="20" class="component-container">
      <el-col v-for="(item, key) in dataList" :key="key" :span="24" :class="colorMap[item.status]">
        <div class="cell m-b">
          <div class="cell-title">{{ item.name }}</div>
          <div class="cell-body" v-for="(cell, idx) in item.instance" :key="idx" :style="{ 'border-color': borderColorMap[cell.status] }">
            <el-row class="row">
              <el-col :span="24" class="m-b-sm">
                <span class="status">
                  <!-- TODO: cmp-element -->
                  <status-icon :type="statusFilter(cell.status, 'color')"></status-icon>
                </span>
                {{ cell.host }}
              </el-col>
              <el-col :span="24"> 主节点：{{ booleanFilter(cell.master) }} </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getComponents } from 'services/system/service_system'
import { statusFilter, colorMap, borderColorMap } from './filters'
import { booleanFilter } from '@/filters/common'

interface InstanceItem {
  host: string
  status: string
  master?: boolean
  [key: string]: unknown
}

interface ComponentItem {
  name: string
  status: string
  instance: InstanceItem[]
}

const dataList = ref<ComponentItem[] | ''>('')

function getList(): void {
  getComponents().then((data: any) => {
    if (data.success) {
      dataList.value = data.data
    }
  })
}

onMounted(getList)
</script>

<style scoped lang="scss">
@import './index';
.cell {
  display: flex;
  .cell-body {
    margin-right: 10px;
  }
}
</style>
