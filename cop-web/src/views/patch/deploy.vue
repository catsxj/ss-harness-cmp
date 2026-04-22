<template>
  <div>
    <AdvanceTable title="补丁部署列表" :data="list" :params="params" :total="total" :searchConfigs="deploySearchConfigs" :columns="deployColumns" :get-list="getList" :loading="loading">
      <template #action>
        <el-button type="primary" @click="create(null, 2)" icon="el-icon-plus">
          新增
        </el-button>
      </template>
      <template #name="val, record">
        <el-button type="text" @click="create(record, 4)">
          {{ val }}
        </el-button>
      </template>
      <template #status="status">
        <status-icon :type="taskStatusFilter(status, 'color')">{{ taskStatusFilter(status) }}</status-icon>
      </template>
      <template #type="type">
        <span>{{ type | getInspectTypeName }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="create(record, 3)" :disabled="record.status === 'APPROVED'">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record, 3)" :disabled="record.status === 'APPROVED'">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="immediateRun(record.id)" :disabled="record.status !== 'APPROVED'">
              <i class="el-icon-video-play"></i>
              执行
            </el-dropdown-item>
            <el-dropdown-item @click.native="handleRelease(record)" v-if="record.status === 'DEVELOPING'">
              <i class="el-icon-top"></i>
              发布
            </el-dropdown-item>
            <el-dropdown-item @click.native="handleRecall(record, 'recall')" v-if="record.status === 'APPROVED'">
              <i class="el-icon-bottom"></i>
              下架
            </el-dropdown-item>
            <!-- <el-dropdown-item v-if="record.status == 'FAILED' && !record.timing" @click.native="timingRun(record.id)">
              <i class="el-icon-time"></i>
              定时执行
            </el-dropdown-item>
            <el-dropdown-item v-if="record.status == 'FAILED' && record.timing" @click.native="timingCancel(record.id)">
              <i class="el-icon-document-copy"></i>
              取消定时执行
            </el-dropdown-item> -->
            <el-dropdown-item v-if="record.status == 'COMPLETE'" @click.native="readHistory(record.id)">
              <i class="el-icon-tickets"></i>
              执行详情
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>

    <el-dialog title="设置定时时间" :close-on-click-modal="false" v-if="timingVisible" :visible.sync="timingVisible" width="400px" append-to-body>
      <el-form :model="timingFormData">
        <el-form-item label-width="100px" label="定时时间：">
          <el-date-picker v-model="timingFormData.timing" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择定时时间"> </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="timingVisible = false">{{ complianceInfo.type == 4 ? '返回' : '取消' }}</el-button>
        <el-button type="primary" @click.native="timingSubmit" :loading="timingLoading">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="complianceInfo.name" :close-on-click-modal="false" v-if="detailvisible" :visible.sync="detailvisible" width="1200px" append-to-body>
      <div style="padding: 0 20px">
        <create-inspect ref="cinspect" style="margin: -20px" :dialogData="complianceInfo" @success="handleSuccess" @cancel="handleCancel"> </create-inspect>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="detailvisible = false">{{ complianceInfo.type == 4 ? '返回' : '取消' }}</el-button>
        <el-button type="primary" v-if="complianceInfo.type != 4" @click.native="addSubmit" :loading="loading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CreateInspect from './components/addDeploy'
import { getInspectTypeName } from './utils/index'
import { getPatchList, patchOperate, removePatch, removeBatchPatch, releasePatch, recallPatch } from 'services/task/patch'
import { deployColumns, deploySearchConfigs } from './config'
import { taskStatusFilter } from '@/filters/index'

export default {
  components: {
    CreateInspect
  },
  data() {
    return {
      deployColumns,
      deploySearchConfigs,
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      timingLoading: false,
      timingVisible: false,
      timingFormData: {
        timing: ''
      },
      timingId: null,
      idList: [],
      total: 0,
      complianceInfo: {},
      detailvisible: false
    }
  },
  computed: {
    canDelete() {
      return this.idList && this.idList.length > 0
    }
  },
  filters: {
    getInspectTypeName
  },
  methods: {
    taskStatusFilter,
    handleRelease(data) {
      this.$confirm(`您确定要发布该模板【${data.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        releasePatch(data.id).then(data => {
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
        recallPatch(data.id).then(data => {
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
    // 立即执行
    immediateRun(id) {
      this.$confirm('是否确认执行', '操作确认', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        patchOperate(id, 'run').then(res => {
          if (res.success) {
            this.$notify.success(res.message)
            this.getList()
          }
        })
      })
    },
    timingCancel(id) {
      this.$confirm('是否确认取消定时执行', '操作确认', {
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        patchOperate(id, 'cancle').then(res => {
          if (res.success) {
            this.$notify.success(res.message)
            this.getList()
          }
        })
      })
    },
    // 定时执行
    timingRun(id) {
      this.timingId = id
      this.timingFormData.timing = ''
      this.timingVisible = true
    },
    timingSubmit() {
      const setTime = new Date(this.timingFormData.timing).getTime()
      const nowTime = new Date().getTime()
      if (!this.timingFormData.timing) {
        this.$message.error('定时时间不能为空')
        return
      }
      if (setTime < nowTime) {
        this.$message.error('定时时间不能早于当前时间')
        return
      }
      this.timingLoading = true
      patchOperate(this.timingId, 'timing', {
        timing: this.timingFormData.timing
      })
        .then(res => {
          if (res.success) {
            this.$notify.success(res.message)
            this.timingVisible = false
            this.getList()
          }
        })
        .finally(_ => {
          this.timingLoading = false
        })
    },
    readHistory(id) {
      this.$router.push({
        name: 'PatchHistory',
        query: {
          id
        }
      })
    },
    getList(data) {
      getPatchList(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    create(row, type) {
      const nameList = {
        2: '创建补丁部署',
        3: '编辑补丁部署',
        4: '查看补丁部署'
      }
      if (type != 2) {
        const { id, executeTemplate, status } = row
        this.complianceInfo.id = id
        this.complianceInfo.status = status
        this.complianceInfo.executeTemplate = executeTemplate
      } else {
        delete this.complianceInfo.id
      }
      this.complianceInfo.name = nameList[type]
      this.complianceInfo.type = type
      this.loading = false
      this.detailvisible = true
    },

    remove(data) {
      this.$confirm(`是否确认删除【${data.name}】`, '操作确认', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removePatch(data.id).then(data => {
          if (data.success) {
            this.$message.success(data.message)
            this.getList()
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
        2: '创建成功',
        3: '更新成功',
        5: '克隆操作成功'
      }
      this.$notify.success(nameList[this.complianceInfo.type])
      this.getList()
    },
    handleCancel() {
      this.loading = false
    },
    handleSelectItem(selection) {
      this.idList = []
      selection.forEach(item => {
        this.idList.push(item.id)
      })
    }
  }
}
</script>
