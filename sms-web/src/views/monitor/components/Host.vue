/** * Created by HaijunZhang on 2019/12/16. */
<template>
  <div>
    <el-row type="flex" :gutter="20" class="component-container">
      <el-col v-for="item in list" :key="item.host" :span="12" class="m-b-sm" :class="colorMap[item.status]">
        <div class="cell cur-point" @click="getDetail(item)">
          <div class="cell-title">{{ item.host }}</div>
          <el-row @click="getDetail(cell)">
            <el-col :span="8">
              <gauge-charts v-if="item.cpuUsed" height="200px" :id="`cpuUsage${item.host}`" width="100%" :data="{ min: 0, max: 100, data: { name: 'CPU利用率', value: item.cpuUsed } }"></gauge-charts>
            </el-col>
            <el-col :span="8">
              <gauge-charts v-if="item.memUsed" height="200px" :id="`memUsage${item.host}`" width="100%" :data="{ min: 0, max: 100, data: { name: '内存利用率', value: item.memUsed } }"></gauge-charts>
            </el-col>
            <el-col :span="8">
              <gauge-charts v-if="item.diskUsed" height="200px" :id="`disk${item.host}`" width="100%" :data="{ min: 0, max: 100, data: { name: '磁盘利用率', value: item.diskUsed } }"></gauge-charts>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
    <el-drawer v-if="detailVisible" title="主机详情" :visible.sync="detailVisible" direction="rtl" class="host-detail" size="80%">
      <HostOverview :item="currentHost" />
    </el-drawer>
  </div>
</template>

<script>
import HostOverview from './HostOverview.vue'
import { getServers } from 'services/system/service_system'
import { statusFilter, colorMap } from './filters'

export default {
  components: {
    HostOverview
  },
  data() {
    return {
      timer: 0,
      statusFilter,
      detailVisible: false,
      colorMap,
      currentHost: {},
      list: []
    }
  },
  created() {
    this.getList()
    this.startInterval()
  },
  destroyed() {
    clearInterval(this.timer)
  },
  methods: {
    startInterval() {
      this.timer = setInterval(this.getList, 1000 * 60)
    },
    getList() {
      getServers().then((data) => {
        if (data.success) {
          this.list = data.data
        }
      })
    },
    getDetail(item) {
      this.detailVisible = true
      this.currentHost = item
    }
  }
}
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
