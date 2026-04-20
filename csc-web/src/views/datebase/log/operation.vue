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
      <el-table-column prop="name" label="生成时间" show-overflow-tooltip></el-table-column>
      <el-table-column prop="name" label="日志级别" show-overflow-tooltip></el-table-column>
      <el-table-column prop="name" label="日志信息" show-overflow-tooltip></el-table-column>
    </basic-table>
  </div>
</template>

<script>
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
      },
      addData: {
        dialog: false,
        data: {}
      },
      dateValue: []
    }
  },
  created() {
    // this.getList()
  },
  methods: {
    add() {
      this.$confirm('你要立即备份实例嘛', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {})
    },
    remove(id) {
      this.$confirm('请确认是否删除该数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: '/shopping/cart/remove',
          method: 'POST',
          data: { id: id }
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
          }
        })
      })
    },
    getList() {
      this.$http({
        method: 'post',
        url: '/volumebackup/list',
        options: {
          noParam: true
        },
        data: this.params
      }).then(data => {
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
        'gmtStart:RANGE': this.dateValue
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
