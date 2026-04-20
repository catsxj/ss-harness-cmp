<template>
  <div>
    <el-row type="flex" :gutter="20" class="component-container">
      <el-col v-for="(item, key) in data.service" :key="key" :span="modelMap[data.hosts]" :class="colorMap[item.status]">
        <div class="cell">
          <div class="cell-title">{{ item.name }}</div>
          <div class="cell-body" :class="cell.status !== 'running' && 'disabled'" v-for="(cell, key) in item.instance" :key="key" @click="getDetail(cell)" :style="{ 'border-color': borderColorMap[cell.status] }">
            <el-row class="row" :gutter="10">
              <el-dropdown class="setting">
                <span class="el-dropdown-link">
                  <i class="el-icon-setting"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.stop.native="handleRealLog(cell)">实时日志</el-dropdown-item>
                  <el-dropdown-item @click.stop.native="download(cell)">日志下载</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-col :span="24" class="m-b-sm">
                <span class="status">
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
    <common-detail-right v-if="detailVisible" title="服务详情" @goBack="goBack">
      <template #item_container>
        <common-detail-item :label="item.name" v-for="item in detailData" :key="item.name">{{ item.value }}</common-detail-item>
      </template>
    </common-detail-right>
    <!--实时日志-->
    <RealLog v-if="realLog.visible" :realLogData="realLog"></RealLog>
    <LogDownload v-if="logDownload.visible" :dialog="logDownload"></LogDownload>
  </div>
</template>

<script>
import RealLog from './realLog.vue'
import LogDownload from './logDownload.vue'
import { getServices, getStatus } from 'services/system/service_system'
import { statusFilter, colorMap, borderColorMap } from './filters'

export default {
  components: { RealLog, LogDownload },
  data() {
    return {
      modelMap: {
        6: 12,
        3: 12,
        1: 6
      },
      statusFilter,
      colorMap,
      borderColorMap,
      data: '',
      relationData: {},
      detailVisible: false,
      detailSetting: {
        type: 'host',
        columns: []
      },
      detailData: {},
      realLog: {
        visible: false,
        data: {}
      },
      logDownload: {
        visible: false
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getData(value) {
      this.getList()
    },
    getList() {
      getServices().then((data) => {
        if (data.success) {
          this.data = data.data
        }
      })
    },
    download(item) {
      this.logDownload = {
        visible: true,
        data: Object.assign({}, item)
      }
    },
    getDetail(row) {
      if (row.status !== 'running') {
        return
      }
      this.detailVisible = true
      getStatus({
        value: row.host
      }).then((data) => {
        if (data.success) {
          const array = []
          for (const key in data.data) {
            array.push({
              name: key,
              value: data.data[key]
            })
          }
          this.detailData = array
        }
      })
    },
    goBack() {
      this.detailVisible = false
    },
    handleRealLog(row) {
      this.realLog = {
        visible: true,
        data: row
      }
    }
  }
}
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
