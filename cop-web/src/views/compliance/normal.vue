<template>
  <div>
    <AdvanceTable title="常规检查列表" :data="list" :params="params" :total="total" :searchConfigs="normalSearchConfigs" :columns="normalColumns" :get-list="getList" :loading="loading" ref="multipleTable">
      <template #action>
        <el-button type="primary" @click="create(null, 2)" icon="el-icon-plus">
          新增
        </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="create(record, 4)">
          {{ val }}
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
        <el-button type="text" @click="remove(record)" :disabled="record.status !== 'DEVELOPING'">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="run(record)" :disabled="record.status !== 'APPROVED'">
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
    <el-dialog :title="complianceInfo.name" :close-on-click-modal="false" v-if="detailvisible" :visible.sync="detailvisible" width="1200px" append-to-body>
      <div style="padding: 0 20px">
        <create-inspect ref="cinspect" style="margin: -20px" :complianceType="complianceInfo.type" :id="complianceInfo.id" @success="handleSuccess" @cancel="handleCancel"> </create-inspect>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="detailvisible = false">{{ complianceInfo.type == 4 ? '返回' : '取消' }}</el-button>
        <el-button type="primary" v-if="complianceInfo.type != 4" @click.native="addSubmit" :loading="loading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CreateInspect from './compliance'
import { getRoutineList, routineOperate, removeRoutine, releaseRoutine, recallRoutine } from 'services/task/compliance'
import { normalColumns, normalSearchConfigs } from './config'
import { taskStatusFilter } from '@/filters/index'
export default {
  components: {
    CreateInspect
  },
  data() {
    return {
      taskStatusFilter,
      normalColumns,
      normalSearchConfigs,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      complianceInfo: {},
      detailvisible: false,
      loading: false
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
        name: 'ComplianceHistory',
        query: {
          routineId: id,
          name
        }
      })
    },
    getList(data) {
      getRoutineList(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    create(row, type) {
      const nameList = {
        2: '创建常规合规',
        3: '编辑常规合规',
        4: '查看常规合规',
        5: '常规合规克隆'
      }
      if (type != 2) {
        this.complianceInfo.id = row.id
      } else {
        delete this.complianceInfo.id
      }
      this.complianceInfo.name = nameList[type]
      this.complianceInfo.type = type
      this.loading = false
      this.detailvisible = true
    },
    run(row) {
      this.$confirm('是否确认执行该常规合规', '操作确认', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        routineOperate('run', row.id).then((data) => {
          if (data.success) {
            this.$notify({ message: '已执行', type: 'success' })
          }
        })
      })
    },
    remove(data) {
      this.$confirm(`是否确认删除【${data.name}】`, '操作确认', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeRoutine(data.id).then((data) => {
          if (data.success) {
            this.$message({ message: '删除成功', type: 'success' })
            this.getList()
            this.idList = []
          }
        })
      })
    },
    addSubmit() {
      this.loading = true
      this.$refs.cinspect.submit('create')
    },
    handleSuccess() {
      this.loading = false
      this.detailvisible = false
      const nameList = {
        2: '常规合规创建成功',
        3: '常规合规更新成功',
        5: '常规合规克隆操作成功'
      }
      this.$notify.success(nameList[this.complianceInfo.type])
      this.getList()
    },
    handleCancel() {
      this.loading = false
    }
  }
}
</script>
