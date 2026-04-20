<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="任务名称" v-model="listQuery.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-select clearable v-model="listQuery.status" placeholder="任务状态">
          <el-option v-for="(value, key) in statusData" :key="key" :label="value" :value="key"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column label="任务名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <router-link class="detail-href" :to="{ name: 'AwaitInstancePreview', params: { id: scope.row.id } }">
            {{ scope.row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="任务状态">
        <template slot-scope="scope">
          <status-icon :type="scope.row.status | applyStatus('color')">
            {{ scope.row.status | applyStatus('name') }}
          </status-icon>
        </template>
      </el-table-column>
      <el-table-column label="操作人" prop="operator"></el-table-column>
      <el-table-column label="创建时间" prop="gmtCreate" min-width="110px"></el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <el-button :disabled="scope.row.status != 'APPROVED'" type="text" @click="handleExe(scope.row)">
            <Icon type="icon-life-saver"></Icon>
            执行
          </el-button>
          <div class="action-divider"></div>
          <el-button :disabled="scope.row.status == 'RUNNING' || scope.row.status == 'APPROVING'" type="text" @click="handleDelete(scope.row)"> <i class="el-icon-delete"></i> 删除 </el-button>
        </template>
      </el-table-column>
    </basic-table>
  </el-card>
</template>

<script>
import { getInstance, removeInstance, operateInstance } from 'services/task/task'

const statusData = {
  REFUSED: '审批拒绝',
  APPROVING: ' 审批中',
  APPROVED: '审批通过'
}
export default {
  data() {
    return {
      statusData,
      loading: false,
      dialogVisibleFlag: false,
      applyData: {},
      list: null,
      total: null,
      dialogVisible: false,
      addData: {},
      route: {},
      listQuery: {
        name: '',
        date: ''
      },
      params: {
        page: 1,
        rows: 10
      }
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    getList() {
      getInstance(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        status: this.listQuery.status,
        await: true,
        'name:LK': this.listQuery.name
      })
      this.getList()
    },
    // 删除任务
    handleDelete(row) {
      this.$confirm(`您确定要删除任务【${row.name}】吗?`, '提示', {
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeInstance(row.id).then(data => {
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
    handleExe(row) {
      this.$confirm(`是否确认执行该任务【${row.name}】?`, '提示', {
        confirmButtonText: '执行',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        operateInstance(row.id, 'start').then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
          }
        })
      })
    }
  }
}
</script>
