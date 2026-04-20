<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="任务名称" v-model="listQuery.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-select clearable v-model="listQuery.status" placeholder="任务状态">
          <el-option v-for="(value, key) in taskExeOptions" :key="key" :label="value" :value="key"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker v-model="listQuery.date" type="datetimerange" start-placeholder="执行开始时间" end-placeholder="执行结束时间"> </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column label="任务名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <router-link class="detail-href" :to="{ name: 'TaskHistoryPreview', params: { id: scope.row.id } }">
            {{ scope.row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="启动人" prop="operator"> </el-table-column>
      <el-table-column label="任务状态">
        <template slot-scope="scope">
          <status-icon :type="scope.row.status | taskExeStatusFilter('color')">{{ scope.row.status | taskExeStatusFilter('name') }} </status-icon>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" prop="gmtStart" min-width="110px"> </el-table-column>
      <el-table-column label="结束时间" prop="gmtFinish" min-width="110px"> </el-table-column>
      <el-table-column label="总耗时（s）" prop="cost"> </el-table-column>
    </basic-table>
  </el-card>
</template>

<script>
import { taskExeOptions } from '@/common/commonData'
import { getInstance } from 'services/task/task'

export default {
  data() {
    return {
      loading: false,
      taskExeOptions,
      list: null,
      total: null,
      listQuery: {
        name: '',
        executeMode: '',
        status: '',
        date: ''
      },
      params: {
        page: 1,
        rows: 10
      }
    }
  },
  created() {
    this.getList()
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
        'name:LK': this.listQuery.name,
        'gmtStart:RANGE': this.listQuery.date
      })
      this.getList()
    }
  }
}
</script>
