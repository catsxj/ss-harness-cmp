<template>
  <div>
    <el-row type="flex" :gutter="20" class="component-container">
      <el-col v-for="(item, key) in data" :key="key" :span="24" :class="colorMap[item.status]">
        <div class="cell m-b">
          <div class="cell-title">{{ item.name }}</div>
          <div class="cell-body" v-for="(cell, key) in item.instance" :key="key" :style="{ 'border-color': borderColorMap[cell.status] }">
            <el-row class="row">
              <el-col :span="24" class="m-b-sm">
                <span class="status">
                  <status-icon :type="statusFilter(cell.status, 'color')"></status-icon>
                </span>
                {{ cell.host }}</el-col
              >
              <!-- <el-col :span="12"> PID：{{cell.pid}} </el-col> -->
              <el-col :span="24"> 主节点：{{ booleanFilter(cell.master) }} </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getComponents } from 'services/system/service_system'
import { statusFilter, colorMap, borderColorMap } from './filters'
import { booleanFilter } from '@/filters/common'

export default {
  data() {
    return {
      statusFilter,
      booleanFilter,
      data: '',
      colorMap,
      borderColorMap,
      relationData: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      getComponents().then((data) => {
        if (data.success) {
          this.data = data.data
        }
      })
    }
  }
}
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
