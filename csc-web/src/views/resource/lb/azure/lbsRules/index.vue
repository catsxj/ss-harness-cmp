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
        <el-table-column label="负载均衡规则" show-overflow-tooltip>
          <template slot-scope="scope"> {{ scope.row.protocol.toUpperCase() }}({{ scope.row.frontEndPort }}:{{ scope.row.backEndPort }}) </template>
        </el-table-column>
        <el-table-column label="端口" show-overflow-tooltip prop="frontEndPort"></el-table-column>
        <el-table-column label="后端端口" show-overflow-tooltip prop="backEndPort"></el-table-column>
        <el-table-column label="后端池" show-overflow-tooltip prop="backEndName"></el-table-column>
        <el-table-column label="运行状况探测" show-overflow-tooltip prop="probeName"></el-table-column>
        <el-table-column label="空闲超时（分钟）" show-overflow-tooltip prop="idleTimeoutInMinutes"></el-table-column>
        <el-table-column label="操作" width="160px" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="modify(scope.row)" :disabled="detail.isAllDisabeld"> <i class="el-icon-edit"></i> 修改 </el-button>
            <el-button type="text" @click="remove(scope.row)" :disabled="detail.isAllDisabeld"> <i class="el-icon-delete"></i> 删除 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </el-card>
    <add :add-data="addData" v-if="addData.dialog" @back="$emit('back')"></add>
    <modify :add-data="modifyData" v-if="modifyData.dialog" @back="$emit('back')"></modify>
  </div>
</template>

<script>
import { getLbRules, removeLbRules } from 'services/platform/azure'
import add from './add.vue'
import modify from './modify.vue'
import webSocket from '@/common/mixins/webSocket'
import { get } from 'js-cookie'

export default {
  components: { add, modify },
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
      },
      modifyData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('azure.lbRule') > -1) this.getData()
    },
    remove(data) {
      this.$confirm('此操作将删除负载均衡' + data.name + ', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeLbRules(data.id).then(data => {
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
    modify(data) {
      this.modifyData = {
        dialog: true,
        data: {
          id: data.id,
          vendorId: this.detail.vendorId,
          slbId: this.detail.id,
          name: data.name,
          frontEndId: data.frontEndId,
          backEndId: data.backEndId,
          protocol: data.protocol.toUpperCase(),
          idleTimeoutInMinutes: data.idleTimeoutInMinutes,
          frontEndPort: data.frontEndPort,
          backEndPort: data.backEndPort,
          floatingIpEnabled: data.floatingIpEnabled,
          probeId: data.probeId,
          loadDistribution: data.loadDistribution
        }
      }
    },
    add(data) {
      this.addData = {
        dialog: true,
        data: {
          vendorId: this.detail.vendorId,
          slbId: this.detail.id,
          name: '',
          frontEndId: '',
          backEndId: '',
          protocol: 'TCP',
          idleTimeoutInMinutes: 4,
          frontEndPort: 80,
          backEndPort: 80,
          floatingIpEnabled: false,
          probeId: '',
          loadDistribution: 'Default'
        }
      }
    },
    getData() {
      getLbRules(this.params).then(data => {
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
