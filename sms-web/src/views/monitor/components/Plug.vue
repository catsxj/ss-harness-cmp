<template>
  <div>
    <el-row type="flex" :gutter="20" class="component-container">
      <el-col v-for="(item, key) in data" :key="key" :span="24" :class="colorMap[item.status]">
        <div class="cell">
          <div class="cell-title">{{ item.name }}</div>
          <div class="cell-body" v-for="(cell, key) in item.instance" :key="key" :title="cell.host" :style="{ 'border-color': borderColorMap[cell.status] }">
            <el-row class="row">
              <el-col :span="24">
                <span class="status">
                  <status-icon :type="statusFilter(cell.status, 'color')"></status-icon>
                </span>
                {{ cell.host }}
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>
    <common-detail v-if="detailVisible" :setting="detailSetting" :title="detailData.name" @goBack="goBack"> </common-detail>
    <!--实时日志-->
    <RealLog v-if="realLog.visible" :realLogData="realLog"></RealLog>
    <LogDownload v-if="logDownload.visible" :dialog="logDownload"></LogDownload>
  </div>
</template>

<script>
import RealLog from './realLog.vue'
import LogDownload from './logDownload.vue'
import { getLogStats } from 'services/system/log'
import { getPlugs, getStatus } from 'services/system/service_system'
import { statusFilter, colorMap, borderColorMap } from './filters'

export default {
  components: { RealLog, LogDownload },
  data() {
    return {
      statusFilter,
      colorMap,
      data: '',
      relationData: {},
      detailVisible: false,
      borderColorMap,
      detailSetting: {
        type: 'host',
        columns: []
      },
      detailData: [],
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
  mounted() {},
  methods: {
    getData(value) {
      this.getList()
    },
    getList() {
      getPlugs().then((data) => {
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
      this.detailSetting.columns = []
      getStatus({
        value: row.host
      }).then((data) => {
        if (data.success) {
          this.detailData = data.data
          const array = []
          for (const key in this.detailData) {
            array.push({
              name: key,
              value: key
            })
          }
          this.detailSetting.columns.push(array)
          this.detailVisible = true
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
