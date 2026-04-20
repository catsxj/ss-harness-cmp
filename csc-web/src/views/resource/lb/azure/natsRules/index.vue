<template>
  <div>
    <el-card class="wrapper">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="add()" :disabled="detail.isAllDisabeld"> 新增 </el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="tableData" :params="params" :get-list="getData" :total="total">
        <el-table-column label="名称" show-overflow-tooltip prop="name"></el-table-column>
        <el-table-column label="IP版本" show-overflow-tooltip>
          <template> IPv4 </template>
        </el-table-column>
        <el-table-column label="协议" show-overflow-tooltip prop="protocol"></el-table-column>
        <el-table-column label="目的地" show-overflow-tooltip prop="ip">
          <template slot-scope="scope"> {{ scope.row.frontEndName }}({{ scope.row.frontEndIpAddress }}) </template>
        </el-table-column>
        <el-table-column label="协议" show-overflow-tooltip prop="protocol"></el-table-column>
        <el-table-column label="端口" show-overflow-tooltip prop="frontEndPort"></el-table-column>
        <el-table-column label="目标端口" show-overflow-tooltip prop="backEndPort"></el-table-column>
        <el-table-column label="操作" width="160px" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="remove(scope.row)" :disabled="detail.isAllDisabeld"> <i class="el-icon-delete"></i> 删除 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </el-card>
    <add :add-data="addData" v-if="addData.dialog" @back="$emit('back')"></add>
  </div>
</template>

<script>
import { getNatRules, removeNatRules } from 'services/platform/azure'
import add from './add.vue'
import webSocket from '@/common/mixins/webSocket'
import { get } from 'js-cookie'

export default {
  components: { add },
  mixins: [webSocket],
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      params: {
        page: 1,
        rows: 10
      },
      tableData: [],
      total: 0,
      addData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('azure.inboundNatRule') > -1) this.getData()
    },
    remove(data) {
      this.$confirm('此操作将删除负载均衡器出站规则' + data.name + ', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeNatRules(data.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
          }
        })
      })
    },
    add(data) {
      this.addData = {
        dialog: true,
        data: {
          vendorId: this.detail.vendorId,
          slbId: this.detail.id,
          name: '',
          frontEndId: '',
          protocol: 'TCP',
          idleTimeoutInMinutes: 5,
          frontEndPort: 80,
          floatingIPEnabled: false,
          backEndPort: ''
        }
      }
    },
    getData() {
      getNatRules(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.formatSearchParam({
        eqParam: {
          vendorId: this.detail.vendorId,
          slbId: this.detail.id
        }
      })
      this.getData()
    }
  },
  created() {
    this.handleSearch()
  },
  mounted() {}
}
</script>

<style></style>
