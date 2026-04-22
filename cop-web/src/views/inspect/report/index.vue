<template>
  <div>
    <AdvanceTable title="巡检报表列表" :data="list" :searchConfigs="inspectReportSearchConfigs" :params="params" :total="total" :columns="inspectReportColumns" :get-list="getList" :loading="loading" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
      <template #action>
        <el-button type="primary" @click="add" icon="el-icon-plus">
          新增
        </el-button>
        <!-- <el-button type="success" @click="runAll" :disabled="!canDelete"> 启用 </el-button>
        <el-button type="danger" @click="stopAll" :disabled="!canDelete"> 禁用 </el-button> -->
      </template>
      <template #name="val, record">
        <span class="detail-href" @click.stop="view(record.id)">{{ val }}</span>
      </template>
      <template #inspectType="inspectType">
        {{ inspectType | getInspectTypeName }}
      </template>
      <template #period="period">
        <span> {{ periodFilter(period) }}</span>
      </template>
      <template #status="status">
        <status-icon :type="status | reportStatusColor('color')">{{ status | reportStatusFlilter }} </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleEdit(record.id)" :disabled="record.status === 'On'"> <i class="el-icon-edit"></i> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)" icon="el-icon-delete" :disabled="record.status === 'On'"> 删除 </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="hover">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <template v-if="record.status === 'On'">
              <el-dropdown-item @click.native="stop(record.id)"> 禁用 </el-dropdown-item>
            </template>
            <template v-if="record.status === 'Off'">
              <el-dropdown-item @click.native="run(record.id)"> 启用 </el-dropdown-item>
            </template>
            <el-dropdown-item @click.native="handleReportDetail(record)"> 历史 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <add v-if="addDialog.show" :dialog="addDialog" @getList="getList"></add>
    <history v-if="historyDialog.show" :dialog="historyDialog"></history>
    <template-history v-if="templateHistoryDialog.show" :dialog="templateHistoryDialog"></template-history>
  </div>
</template>
<script>
import add from './add'
import history from './history'
import templateHistory from './templateHistory'
import { getReports, removeReports, reportsBatchOperate, reportsOperate, batchRemoveReports } from 'services/task/inspect'
import { getInspectTypeName } from '../utils/index'
import { inspectReportColumns, inspectReportSearchConfigs } from '../config'

export default {
  components: {
    history,
    add,
    templateHistory
  },
  data() {
    return {
      inspectReportColumns,
      inspectReportSearchConfigs,
      loading: false,
      searchData: [],
      list: [],
      idList: [],
      selectList: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      addDialog: {
        show: false
      },
      historyDialog: {
        show: false
      },
      templateHistoryDialog: {
        show: false
      }
    }
  },
  filters: {
    getInspectTypeName,
    reportStatusFlilter(val) {
      return val === 'On' ? '启动' : '禁用'
    },
    reportStatusColor(val) {
      return val === 'On' ? 'success' : 'danger'
    }
  },
  computed: {
    canDelete() {
      return this.selectList && this.selectList.length > 0
    }
  },
  methods: {
    periodFilter(val) {
      const map = {
        Day: '日报',
        Week: '周报',
        Month: '月报'
      };
      return map[val]
    },
    // 批量启用
    runAll() {
      this.refreshId()
      for (const item of this.list) {
        if (this.idList.includes(item.id) && item.status === 'On') {
          return this.$message.error('只能选择处于禁用状态的报表')
        }
      }
      reportsBatchOperate('start', {
        ids: this.idList
      }).then((res) => {
        if (res.success) {
          this.idList = []
          this.$notify.success(res.message)
          this.getList()
        }
      })
    },
    // 批量禁用
    stopAll() {
      this.refreshId()
      for (const item of this.list) {
        if (this.idList.includes(item.id) && item.status === 'Off') {
          return this.$message.error('只能选择处于启动状态的报表')
        }
      }
      reportsBatchOperate('stop', {
        ids: this.idList
      }).then((res) => {
        if (res.success) {
          this.idList = []
          this.$notify.success(res.message)
          this.getList()
        }
      })
    },
    run(id) {
      reportsOperate('start', id).then((res) => {
        if (res.success) {
          this.$notify.success(res.message)
          this.getList()
        }
      })
    },
    stop(id) {
      reportsOperate('stop', id).then((res) => {
        if (res.success) {
          this.$notify.success(res.message)
          this.getList()
        }
      })
    },
    getList(data) {
      this.selectList = [];
      getReports(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    // 新增
    add() {
      this.addDialog.isView = false
      this.addDialog.id = null
      this.addDialog.show = true
      this.addDialog.title = '新增'
    },
    // 查看
    view(id) {
      this.addDialog.id = id
      this.addDialog.title = '查看'
      this.addDialog.isView = true
      this.addDialog.show = true
    },
    // 编辑
    handleEdit(id) {
      this.addDialog.isView = false
      this.addDialog.id = id
      this.addDialog.title = '编辑'
      this.addDialog.show = true
    },
    // 批量删除
    removeAll() {
      this.refreshId()
      this.$confirm('是否确认删除?', '提示', {
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        batchRemoveReports({
          ids: this.idList
        }).then((res) => {
          if (res.success) {
            this.$notify.success(res.message)
            this.getList()
            this.idList = []
          }
        })
      })
    },
    handleDelete(record) {
      this.$confirm(`您确定要删除该巡检报表【${record.name}】吗?`, '提示', {
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeReports(record.id).then((res) => {
          if (res.success) {
            this.$notify.success(res.message)
            this.getList()
          }
        })
      })
    },
    handleReportDetail(row) {
      if (row.type === 'custom') {
        this.historyDialog.show = true
        this.historyDialog.id = row.id
        this.historyDialog.inspectId = row.inspectId
      } else {
        this.templateHistoryDialog.show = true
        this.templateHistoryDialog.id = row.id
        this.templateHistoryDialog.inspectId = row.inspectId
        this.templateHistoryDialog.name = row.name
      }
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
    },
    // 单选
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id == row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    // 全选
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach((item) => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach((item) => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id == row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.marginTop20 {
  margin-top: 20px;
}
</style>
