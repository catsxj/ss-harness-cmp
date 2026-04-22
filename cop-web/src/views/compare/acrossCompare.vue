<template>
  <div>
    <AdvanceTable title="跨机对比列表" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="acrossColumns" :get-list="getList" :loading="loading">
      <template #action>
        <el-button type="primary" @click="handleCreate()" icon="el-icon-plus">
          新增
        </el-button>
      </template>
      <template #taskName="val, record">
        <el-button type="text" @click="view(record)" v-if="record.runstatus == '2'">
          {{ val }}
        </el-button>
        <span v-else>{{ val }}</span>
      </template>
      <template #startTime="startTime">
        {{ ['', null].includes(startTime) ? '即时' : startTime }}
      </template>
      <template #runstatus="runstatus">
        <status-icon :type="runstatus | statusFilter('color')">
          {{ runstatus | statusFilter }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="run(record)" v-if="record.runstatus == '3'" :disabled="['', null].includes(record.startTime)">
          <i class="el-icon-video-play"></i>
          开始
        </el-button>
        <el-button type="text" @click="stop(record)" v-else :disabled="['', null].includes(record.startTime)">
          <i class="el-icon-video-pause"></i>
          停止
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="del(record)" :disabled="!['0', '2', '3'].includes(record.runstatus)">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
      </template>
    </AdvanceTable>
    <build-history-compare v-if="buildVisible" @goBack="buildGoBack" type="2"></build-history-compare>
    <common-detail v-if="compareVisible" @goBack="compareVisible = false" :title="viewInfo.name">
      <div slot="custom_content">
        <view-compare :rData="viewInfo" class="compare-detail"></view-compare>
      </div>
    </common-detail>
  </div>
</template>

<script>
import BuildHistoryCompare from './buildCompare'
import ViewCompare from './viewCompare'
import { getCrossCompareList, removeCrossCompare, operateBackups } from 'services/task/compare'
import { acrossColumns, searchConfigs } from './config'
export default {
  components: {
    BuildHistoryCompare,
    ViewCompare
  },
  data() {
    return {
      acrossColumns,
      searchConfigs,
      loading: false,
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      dialogVisible: false,
      buildVisible: false,
      compareVisible: false,
      viewInfo: {}
    }
  },
  methods: {
    buildGoBack(val) {
      this.buildVisible = false
      if (val) {
        this.getList()
      }
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getList()
    },
    view(row) {
      this.viewInfo.name = `查看对比结果-${row.taskName}`
      this.viewInfo.taskName = row.taskName
      this.compareVisible = true
    },
    del(row) {
      this.$confirm('您确定要删除当前数据吗?', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeCrossCompare(row.id).then((data) => {
          if (data.success) {
            this.$notify.success(data.message)
            this.getList()
          }
        })
      })
    },
    run(row) {
      this.$confirm('是否要启动?', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        operateBackups('start', {
          taskID: row.id
        }).then((data) => {
          if (data.success) {
            this.$notify.success(data.message)
            this.getList()
          }
        })
      })
    },
    stop(row) {
      this.$confirm('是否要停止？', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        operateBackups('stop', {
          taskID: row.id
        }).then((data) => {
          if (data.success) {
            this.$notify.success(data.message)
            this.getList()
          }
        })
      })
    },
    getList() {
      getCrossCompareList(this.params).then((data) => {
        this.list = data?.data?.rows || []
        this.total = data?.data?.total || 0
      })
    },
    handleCreate() {
      this.buildVisible = true
    }
  },
  filters: {
    statusFilter(val, type) {
      const data = { 0: '待执行', 1: '执行中', 2: '已执行', 3: '任务暂停', 4: '任务删除' }
      if (type == 'color') {
        const color = { 0: 'primary', 1: 'normal', 2: 'success', 3: 'warning', 4: 'disabled' }
        return color[val]
      }
      return data[val]
    }
  }
}
</script>

<style lang="scss" scoped>
body#cmp .compare-detail {
  border: 0 !important;
  margin: -20px -15px;
}
</style>
