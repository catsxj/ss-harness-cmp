<template>
  <div>
    <AdvanceTable title="标准对比列表" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="standardColumns" :get-list="getList" :loading="loading">
      <template #action>
        <el-button type="primary" @click="handleCreate()" icon="el-icon-plus">
          新增
        </el-button>
        <el-button @click="fileMgt()" icon="el-icon-document">标准文件管理</el-button>
      </template>
      <template #taskName="val, record">
        <el-button type="text" @click="view(record)" v-if="record.runstatus == '2'">
          {{ val }}
        </el-button>
        <span v-else>{{ val }}</span>
      </template>
      <template #agentIP1="agentIP1">
        <div v-html="agentIP1"></div>
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
    <standard-file v-if="dialogVisible" @goBack="dialogVisible = false" type="1"></standard-file>
    <build-standard-compare v-if="buildVisible" @goBack="buildGoBack"></build-standard-compare>
    <common-detail v-if="compareVisible" @goBack="compareVisible = false" :title="viewInfo.name">
      <div slot="custom_content">
        <view-compare :rData="viewInfo" class="compare-detail"></view-compare>
      </div>
    </common-detail>
  </div>
</template>

<script>
import StandardFile from './standardFile'
import BuildStandardCompare from './buildCompare'
import ViewCompare from './viewCompare'
import { getStandardCompareList, removeCrossCompare, operateBackups, getStandardFiles } from 'services/task/compare'
import { standardColumns, searchConfigs } from './config'
export default {
  components: {
    StandardFile,
    BuildStandardCompare,
    ViewCompare
  },
  data() {
    return {
      standardColumns,
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
    fileMgt() {
      this.dialogVisible = true
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
            this.$notify({ message: data.message, type: 'success' })
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
            this.$notify({ message: '启动成功', type: 'success' })
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
            this.$notify({ message: '停止成功', type: 'success' })
            this.getList()
          }
        })
      })
    },
    getList() {
      getStandardCompareList(this.params).then((data) => {
        this.list = data?.data?.rows || []
        this.total = data?.data?.total || 0
      })
    },
    handleCreate() {
      getStandardFiles().then((data) => {
        if (data.length == 0 || data == null) {
          this.$notify({ message: '没有标准文件，请先上传标准文件', type: 'error' })
        } else {
          this.buildVisible = true
        }
      })
    }
  },
  filters: {
    statusFilter(val, type) {
      const data = { 0: '待执行', 1: '执行中', 2: '已执行', 3: '任务暂停', 4: '任务删除', 5: '执行失败' }
      if (type == 'color') {
        const color = { 0: 'primary', 1: 'normal', 2: 'success', 3: 'warning', 4: 'disabled', 5: 'danger' }
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
