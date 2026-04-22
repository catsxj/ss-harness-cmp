<template>
  <div>
    <AdvanceTable title="定时检查列表" :data="list" :params="params" :total="total" :searchConfigs="timeSearchConfigs" :columns="timeColumns" :get-list="getList" :loading="loading" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
      <template #action>
        <el-button type="primary" @click="create()" icon="el-icon-plus">
          新增
        </el-button>
        <!-- <el-button type="ghost" @click="removeAll" :disabled="!canDelete">
          <i class="el-icon-delete"></i>
          删除
        </el-button> -->
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="create(record, 1)">
          {{ val }}
        </span>
      </template>
      <template #running="running">
        <status-icon :type="running ? 'success' : 'warning'">
          {{ running ? '执行中' : '停止' }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="create(record)" :disabled="record.running">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="del(record)" :disabled="record.running">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="run(record)" v-if="!record.running">
              <i class="el-icon-video-play"></i>
              启动
            </el-dropdown-item>
            <el-dropdown-item @click.native="stop(record)" v-else>
              <i class="el-icon-video-pause"></i>
              停止
            </el-dropdown-item>
            <el-dropdown-item @click.native="readHistory(record)">
              <i class="el-icon-tickets"></i>
              记录
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <el-dialog :title="title[status]" :close-on-click-modal="false" v-if="dialogVisible" :visible.sync="dialogVisible" width="700px" append-to-body>
      <basic-form :model="addData" ref="form" labelWidth="100px" :disabled="status == 'view'">
        <basic-form-item label="名称：" prop="name" validate="required">
          <el-input v-model.trim="addData.name" placeholder="请输入定时合规名称"></el-input>
        </basic-form-item>
        <basic-form-item label="直接启动：" prop="running">
          <el-switch v-model="addData.running" active-color="#13ce66"></el-switch>
        </basic-form-item>
        <basic-form-item label="常规检查：" prop="routineId" validate="required">
          <el-select v-model="addData.routineId" placeholder="请选择常规合规" filterable>
            <el-option v-for="item in routineInspctList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </basic-form-item>
        <select-cron ref="selectCron" :data="addData.cron" :disableSetting="status == 'view'"></select-cron>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading" v-if="status != 'view'">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SelectCron from 'views/task/components/selectCron'
import { getRoutineList, getTimingList, createTimings, modifyTimings, getTimingsDetail, removeTimings, timingsOperate } from 'services/task/compliance'
import { timeColumns, timeSearchConfigs } from './config'

export default {
  components: {
    SelectCron
  },
  data() {
    return {
      timeColumns,
      timeSearchConfigs,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      idList: [],
      selectList: [],
      total: 0,
      dialogVisible: false,
      addData: {
        name: '',
        routineId: '',
        cron: '0 1/5 * * * ?',
        running: true
      },
      routineInspctList: [],
      status: 'create',
      searchData: [],
      superSearchList: [],
      title: {
        create: '创建定时任务',
        update: '编辑定时任务',
        view: '查看定时任务详情'
      },
      loading: false
    }
  },
  computed: {
    canDelete() {
      return this.selectList && this.selectList.length > 0
    }
  },
  methods: {
    getAllRoutine() {
      this.routineInspctList = []
      getRoutineList({
        simple: true,
        params: this.$tools.handleSearchParam({ status: 'APPROVED' })
      }).then((data) => {
        if (data.success) {
          this.routineInspctList = data.data.rows
        }
      })
    },
    readHistory({ id, name }) {
      this.$router.push({
        name: 'ComplianceHistory',
        query: {
          timingId: id,
          name
        }
      })
    },
    getList(data) {
      getTimingList(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    addSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.addData.cron = this.$refs.selectCron.cron
          if (!this.addData.cron) {
            return this.$message.error('请选择定时规则')
          }
          this.loading = true
          let http = createTimings
          if (this.addData.id) {
            http = modifyTimings
          }
          http(this.addData)
            .then((data) => {
              if (data.success) {
                this.$notify({ message: '操作成功', type: 'success' })
                this.dialogVisible = false
                this.getList()
              }
            })
            .finally((_) => {
              this.loading = false
            })
        }
      })
    },
    getTimingById(id) {
      getTimingsDetail(id).then((data) => {
        if (data.success) {
          this.addData.name = data.data.name
          this.addData.running = data.data.running
          this.addData.routineId = data.data.routineId
          this.addData.cron = data.data.cron
          this.dialogVisible = true
        }
      })
    },
    initData() {
      this.addData.name = ''
      this.addData.running = true
      this.addData.routineId = ''
      this.addData.cron = '0 1/5 * * * ?'
    },
    create(row, type) {
      this.initData()
      if (row) {
        this.addData.id = row.id
        this.status = 'update'
        if (type == 1) this.status = 'view'
        this.getTimingById(this.addData.id)
      } else {
        this.status = 'create'
        delete this.addData.id
        this.dialogVisible = true
      }
      this.getAllRoutine()
    },
    stop(row) {
      this.$confirm('是否确认停止该定时合规任务', '操作确认', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        timingsOperate('stop', {
          id: row.id
        }).then((data) => {
          if (data.success) {
            this.$notify({ message: '停止成功', type: 'success' })
            this.getList()
          }
        })
      })
    },
    run(row) {
      this.$confirm('是否确认启动该定时合规任务', '操作确认', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        timingsOperate('run', {
          id: row.id
        }).then((data) => {
          if (data.success) {
            this.$notify({ message: '启动成功', type: 'success' })
            this.getList()
          }
        })
      })
    },
    // 批量删除
    removeAll() {
      this.refreshId()
      this.del(this.idList)
    },
    // 单个删除
    remove(row) {
      this.del(row.id)
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
    },
    del(data) {
      this.$confirm(`是否确认删除定时任务【${data.name}】`, '操作确认', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeTimings(data.id).then((data) => {
          if (data.success) {
            this.$message({ message: data.message, type: 'success' })
            this.getList()
            this.idList = []
          }
        })
      })
    }
  }
}
</script>
