<template>
  <div>
    <AdvanceTable title="定时巡检列表" :data="list" :searchConfigs="timingInspectSearchConfigs" :params="params" :total="total" :columns="timingInspectColumns" :get-list="getList" :loading="loading" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
      <template #action>
        <el-button type="primary" @click="create()" icon="el-icon-plus">
          新增
        </el-button>
        <!-- <el-button type="ghost" @click="operator('removeAll')" :disabled="!batchFlag" :loading="removeAllLoading" icon="el-icon-delete"> 删除 </el-button> -->
        <!-- <el-button type="success" @click="operator('runAll')" :disabled="!batchFlag" :loading="runAllLoading"> 启动 </el-button>
        <el-button type="danger" @click="operator('stopAll')" :disabled="!batchFlag" :loading="stopAllLoading"> 停止 </el-button> -->
      </template>
      <template #name="name, record">
        <span class="detail-href" @click="create(record, 1)">
          {{ name }}
        </span>
      </template>
      <template #running="running">
        <status-icon :type="running ? 'success' : 'warning'">
          {{ running ? '执行中' : '停止' }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="create(record)"  :disabled="record.running">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="operator('remove', record)" icon="el-icon-delete"  :disabled="record.running"> 删除 </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="operator('run', record)" v-if="!record.running">
              <i class="el-icon-video-play"></i>
              启动
            </el-dropdown-item>
            <el-dropdown-item @click.native="operator('stop', record)" v-else>
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
          <el-input v-model.trim="addData.name" placeholder="请输入定时巡检名称"></el-input>
        </basic-form-item>
        <basic-form-item label="直接启动：" prop="running">
          <el-switch v-model="addData.running" active-color="#13ce66"></el-switch>
        </basic-form-item>
        <basic-form-item label="常规巡检：" prop="routineId" validate="required">
          <el-select v-model="addData.routineId" placeholder="请选择常规巡检" filterable>
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
import { getTimings, getAllRoutines, createTimings, modifyTimings, getTimingsDetail, timingsOperate, timingsBatchOperate, removeTimings, removeBatchTimings } from 'services/task/inspect'
import { timingInspectColumns, timingInspectSearchConfigs } from './config'

export default {
  components: {
    SelectCron
  },
  data() {
    return {
      timingInspectColumns,
      timingInspectSearchConfigs,
      removeAllLoading: false,
      stopAllLoading: false,
      runAllLoading: false,
      statusList: [
        { id: '0', name: '停止' },
        { id: '1', name: '执行中' }
      ],
      list: [],
      params: {
        page: 1,
        rows: 10
      },
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
      loading: false,
      idList: [],
      selectList: []
    }
  },
  computed: {
    batchFlag() {
      return this.selectList.length > 0
    }
  },
  methods: {
    getAllRoutine() {
      this.routineInspctList = []
      getAllRoutines().then((data) => {
        if (data.success) {
          this.routineInspctList = data.data
        }
      })
    },
    readHistory({ id, name }) {
      this.$router.push({
        name: 'InspectHistory',
        query: {
          timingId: id,
          name
        }
      })
    },
    getList(data) {
      getTimings(this.params).then((data) => {
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
    // 操作集合
    operator(type, row) {
      let confirmText = '',
        http = '',
        action = '',
        data = null
      switch (type) {
        case 'stop':
          confirmText = '停止该定时巡检任务'
          http = timingsOperate
          action = 'stop'
          data = row.id
          break
        case 'stopAll':
          this.refreshId()
          confirmText = '批量停止定时巡检任务'
          http = timingsBatchOperate
          action = 'stop'
          data = {
            ids: this.idList.join(',')
          }
          break
        case 'run':
          confirmText = '启动该定时巡检任务'
          http = timingsOperate
          action = 'run'
          data = row.id
          break
        case 'runAll':
          this.refreshId()
          confirmText = '批量启动定时巡检任务'
          http = timingsBatchOperate
          action = 'run'
          data = {
            ids: this.idList.join(',')
          }
          break
        case 'remove':
          confirmText = '删除'
          http = removeTimings
          data = row.id
          break
        case 'removeAll':
          this.refreshId()
          confirmText = '删除'
          http = removeBatchTimings
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
        http(data, action).then((res) => {
          this.idList = []
          this.stopAllLoading = false
          this.runAllLoading = false
          this.removeAllLoading = false
          this.$notify.success(res.message)
          this.getList()
        })
      })
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
