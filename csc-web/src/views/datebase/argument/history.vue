<template>
  <div>
    <el-dialog title="修改历史" :visible.sync="addData.dialog" width="60%" v-if="addData.dialog" append-to-body>
      <div>
        <basic-table :data="list" :params="params" :get-list="getList" :total="total">
          <el-table-column prop="name" label="参数名" show-overflow-tooltip></el-table-column>
          <el-table-column prop="oldValue" label="变更前的参数值" show-overflow-tooltip></el-table-column>
          <el-table-column prop="newValue" label="变更后的参数值" show-overflow-tooltip></el-table-column>
          <el-table-column label="是否生效" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.effective ? '已生效' : '未生效' }}
            </template>
          </el-table-column>
          <el-table-column prop="gmtCreate" label="变更时间" show-overflow-tooltip> </el-table-column>
        </basic-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addData.dialog = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRdsParametersLogs, getKvsParametersLogs } from 'services/resource/datebase'
export default {
  props: {
    addData: {
      type: Object
    },
    url: {
      type: String
    }
  },
  data() {
    return {
      list: [],
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
      const getList = this.url == 'rds' ? getRdsParametersLogs : getKvsParametersLogs
      getList(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        rdsId: this.url == 'rds' ? this.addData.data.id : '',
        kvsId: this.url == 'kvs' ? this.addData.data.id : '',
        name: this.addData.data.name
      })
      this.getList()
    }
  }
}
</script>

<style></style>
