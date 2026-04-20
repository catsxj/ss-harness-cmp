<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <div class="text_mine">提示：数据库连接，请在另一台主机用第三方连接工具连接，数据库信息如下列表</div>
      </el-form-item>
    </el-form>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column prop="name" label="数据库名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="address" label="连接地址" show-overflow-tooltip></el-table-column>
      <el-table-column prop="users" label="数据库账号" show-overflow-tooltip></el-table-column>
      <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
    </basic-table>
  </div>
</template>

<script>
import { getRdsConnections } from 'services/resource/datebase'
export default {
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      list: null,
      total: null,
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
      getRdsConnections(this.params).then(data => {
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
        rdsId: this.detail.id
      })
      this.getList()
    }
  }
}
</script>
<style scoped>
.text_mine {
  font-size: 10px;
  color: #999;
}
</style>
