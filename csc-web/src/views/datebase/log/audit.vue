<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-date-picker class="w-full" v-model="dateValue" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间"> </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column prop="target" label="请求对象" show-overflow-tooltip></el-table-column>
      <el-table-column prop="action" label="操作类别" show-overflow-tooltip></el-table-column>
      <el-table-column prop="result" label="操作结果" show-overflow-tooltip></el-table-column>
      <el-table-column prop="requestIp" label="客户端IP" show-overflow-tooltip></el-table-column>
      <el-table-column prop="gmtCreate" label="执行时间" show-overflow-tooltip></el-table-column>
      <el-table-column prop="cost" label="消耗时间（ms）" show-overflow-tooltip></el-table-column>
    </basic-table>
  </div>
</template>

<script>
import { getRdsLogs, getKvsLogs } from 'services/resource/datebase'

export default {
  props: {
    detail: {
      type: Object
    },
    url: {
      type: String
    }
  },
  data() {
    return {
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      addData: {
        dialog: false,
        data: {}
      },
      dateValue: ''
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    getList() {
      const getList = this.url == 'rds' ? getRdsLogs : getKvsLogs
      getList(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach(item => {
            const nowTime = new Date()
            const nowDate = nowTime.getTime()
            item.isExpired = false
            const expiredTimeDate = new Date(item.expiredTime).getTime()
            if (expiredTimeDate < nowDate) {
              item.isExpired = true
            }
          })
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'gmtCreate:RANGE': this.dateValue,
        rdsId: this.url == 'rds' ? this.detail.id : '',
        kvsId: this.url == 'kvs' ? this.detail.id : ''
      })
      this.getList()
    }
  }
}
</script>
<style scoped>
.detail_icon {
  font-size: 25px;
  margin: 10px;
  color: #409eff;
}
</style>
