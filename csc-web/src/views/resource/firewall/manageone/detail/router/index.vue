<template>
  <div>
    <el-card class="wrapper">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="add()"> 新增 </el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="tableData" :params="params" :get-list="getData" :total="total">
        <el-table-column label="名称" prop="name" show-overflow-tooltip> </el-table-column>
        <el-table-column label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | openstackServer }}</status-icon>
          </template>
        </el-table-column>
        <el-table-column label="管理状态" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.adminStateup | adminStateupFilter }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160px" align="center">
          <template slot-scope="scope">
            <el-button :disabled="scope.row.disabled" type="text" @click="remove(scope.row)"> <i class="el-icon-delete"></i> 取消关联 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </el-card>
    <add :add-data="addData" v-if="addData.dialog"></add>
  </div>
</template>

<script>
import { getRouter, removeRouter, detailRouter, createRouter, modifyRouter, firewallRouter } from 'services/platform/index'
import add from './add.vue'
import webSocket from '@/common/mixins/getGlobalSocket'

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
      searchData: {
        keyName: '',
        value: ''
      },
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
      if (data.operate.indexOf('fwRouter') > -1) this.getData()
    },
    remove(data) {
      this.$confirm('此操作将取消关联所选VPC, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        firewallRouter({
          id: this.detail.id,
          vendorId: this.detail.vendorId,
          routerIds: [data.id],
          operation: 'remove'
        }).then(data => {
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
          firewallId: this.detail.id,
          routerIds: []
        }
      }
    },
    getData() {
      getRouter(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch(type) {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        vendorId: this.detail.vendorId,
        firewallId: this.detail.id
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

<style>
.no-searchBox {
  padding: 10px;
}

.title-header {
  margin-top: 10px;
  margin-bottom: 15px;
  text-indent: 8px;
  border-left: 3px solid #88b7e0;
  font-size: 14px;
  font-weight: 600;
}
</style>
