<template>
  <div>
    <AdvanceTable title="常规巡检列表" :data="list" :searchConfigs="routineInspectSearchConfigs" :params="params" :total="total" :columns="inspectColumns" :get-list="getList" :loading="loading"
      ref="multipleTable">
      <template #action>
        <el-button type="primary" @click="create(null, 2)" icon="el-icon-plus">
          新增
        </el-button>
        <!-- <el-button type="success" @click="operator('runAll')" :disabled="!canDelete" :loading="runAllLoading"> 执行 </el-button> -->
      </template>
      <template #name="name, record">
        <span class="detail-href" @click="create(record, 4)">
          {{ name }}
        </span>
      </template>
      <template #status="status">
        <status-icon :type="taskStatusFilter(status, 'color')">{{ taskStatusFilter(status) }}</status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="create(record, 3)" :disabled="record.status !== 'DEVELOPING'">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)" icon="el-icon-delete" :disabled="record.status !== 'DEVELOPING'"> 删除 </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="operator('run', record)" :disabled="record.status !== 'APPROVED'">
              <i class="el-icon-video-play"></i>
              执行
            </el-dropdown-item>
            <el-dropdown-item @click.native="create(record, 5)">
              <i class="el-icon-document-copy"></i>
              克隆
            </el-dropdown-item>
            <el-dropdown-item @click.native="readHistory(record)">
              <i class="el-icon-tickets"></i>
              记录
            </el-dropdown-item>
            <el-dropdown-item @click.native="handleRelease(record)" v-if="record.status === 'DEVELOPING'">
              <i class="el-icon-top"></i>
              发布
            </el-dropdown-item>
            <el-dropdown-item @click.native="handleRecall(record, 'recall')" v-if="record.status === 'APPROVED'">
              <i class="el-icon-bottom"></i>
              下架
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <el-dialog :title="inspectInfo.name" :close-on-click-modal="false" v-if="detailvisible" :visible.sync="detailvisible" width="1200px" append-to-body>
      <div style="padding: 0 20px">
        <create-inspect ref="cinspect" style="margin: -20px" :inspectType="inspectInfo.type" :id="inspectInfo.id" @success="handleSuccess" @cancel="handleCancel"> </create-inspect>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="detailvisible = false">{{ inspectInfo.type == 4 ? '返回' : '取消' }}</el-button>
        <el-button type="primary" v-if="inspectInfo.type != 4" @click.native="addSubmit" :loading="loading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CreateInspect from './fastInspect'
import { getRoutine, RoutineOperate, RoutineBatchOperate, removeRoutine, removeBatchRoutine, releaseRoutine, recallRoutine } from '@/services/task/inspect'
import { inspectColumns, routineInspectSearchConfigs } from './config'
import { taskStatusFilter } from '@/filters/index'

export default {
  components: {
    CreateInspect
  },
  data() {
    return {
      taskStatusFilter,
      inspectColumns,
      routineInspectSearchConfigs,
      runAllLoading: false,
      removeAllLoading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      inspectInfo: {},
      detailvisible: false,
      loading: false
    }
  },
  computed: {
    canDelete() {
      return this.selectList && this.selectList.length > 0
    }
  },
  methods: {
    handleRelease(data) {
      this.$confirm(`您确定要发布该模板【${data.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        releaseRoutine(data.id).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleRecall(data) {
      this.$confirm(`您确定要下架该模板【${data.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        recallRoutine(data.id).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    readHistory({ id, name }) {
      this.$router.push({
        name: 'InspectHistory',
        query: {
          routineId: id,
          name
        }
      })
    },
    getList(data) {
      getRoutine(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    create(row, type) {
      const nameList = {
        2: '创建常规巡检',
        3: '编辑常规巡检',
        4: '查看常规巡检',
        5: '常规巡检克隆'
      }
      if (type != 2) {
        this.inspectInfo.id = row.id
      } else {
        delete this.inspectInfo.id
      }
      this.inspectInfo.name = nameList[type]
      this.inspectInfo.type = type
      this.loading = false
      this.detailvisible = true
    },
    addSubmit() {
      this.loading = true
      this.$refs.cinspect.submit('create')
    },
    handleSuccess() {
      this.loading = false
      this.detailvisible = false
      const nameList = {
        2: '常规巡检创建成功',
        3: '常规巡检更新成功',
        5: '常规巡检克隆操作成功'
      }
      this.$notify.success(nameList[this.inspectInfo.type])
      this.getList()
    },
    handleCancel() {
      this.loading = false
    },
    // 操作集合
    operator(type, row) {
      let confirmText = '',
        http = '',
        action = '',
        data = null
      switch (type) {
        case 'run':
          confirmText = '启动该常规巡检任务'
          http = RoutineOperate
          action = 'run'
          data = row.id
          break
        case 'runAll':
          this.refreshId()
          confirmText = '批量启动常规巡检任务'
          http = RoutineBatchOperate
          action = 'run'
          data = {
            ids: this.idList.join(',')
          }
          break
        case 'remove':
          confirmText = '删除'
          http = removeRoutine
          data = row.id
          break
        case 'removeAll':
          this.refreshId()
          confirmText = '删除'
          http = removeBatchRoutine
          data = {
            ids: this.idList.join(',')
          }
          break
      }
      this.$confirm(`是否确认${confirmText}`, '操作确认', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        switch (type) {
          case 'stopAll':
            this.stopAllLoading = true
            break
          case 'runAll':
            this.runAllLoading = true
            break
          case 'removeAll':
            this.removeAllLoading = true
            break
        }
        http(data, action)
          .then((res) => {
            this.idList = []
            this.getList()
            if (res.success) {
              this.$notify.success(res.message)
              this.idList = []
            }
          })
          .finally((_) => {
            this.runAllLoading = false
            this.removeAllLoading = false
          })
      })
    },
    handleDelete(data) {
      this.$confirm(`是否确认删除【${data.name}】`, '操作确认', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeRoutine(data.id).then((data) => {
          if (data.success) {
            this.$message({ message: '删除成功', type: 'success' })
            this.getList()
          }
        })
      })
    }
  }
}
</script>
