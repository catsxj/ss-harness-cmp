<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-date-picker v-model="listQuery.date" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间"> </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="登录IP" v-model="listQuery.requestIp"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="响应地址" v-model="listQuery.responseIp"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
      <el-form-item class="pull-right">
        <el-button type="ghost" @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column label="登录账号" prop="username"> </el-table-column>

      <el-table-column label="登录IP" prop="requestIp"> </el-table-column>

      <el-table-column label="响应地址" prop="responseIp"> </el-table-column>

      <el-table-column label="登录结果" prop="status">
        <template slot-scope="scope">
          {{ scope.row.status == true ? '成功' : '失败' }}
        </template>
      </el-table-column>

      <el-table-column label="登录时间" prop="gmtCreate"> </el-table-column>
    </basic-table>
  </el-card>
</template>

<script>
import { getTrack } from 'services/system/manager'

export default {
  data() {
    return {
      list: [],
      total: 0,
      listQuery: {
        date: '',
        requestIp: '',
        responseIp: ''
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
    goBack() {
      this.$router.back(-1)
    },
    getList() {
      getTrack(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    // 查询
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        username: this.$router.currentRoute.params.name,
        'requestIp:LK': this.listQuery.requestIp,
        'responseIp:LK': this.listQuery.responseIp,
        'gmtCreate:RANGE': this.listQuery.date
      })
      this.getList()
    }
  }
}
</script>
<style scoped>
.search-item {
  width: 12%;
}
</style>
