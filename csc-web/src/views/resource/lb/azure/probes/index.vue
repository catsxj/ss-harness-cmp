<template>
  <div>
    <el-card class="wrapper">
      <el-form :inline="true">
        <el-form-item>
          <el-button :disabled="detail.isAllDisabeld" type="primary" @click="add()"> 新增 </el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="tableData" :params="params" :get-list="getData" :total="total">
        <el-table-column label="名称" show-overflow-tooltip prop="name"></el-table-column>
        <el-table-column label="协议" show-overflow-tooltip prop="protocol">
          <template slot-scope="scope">
            {{ scope.row.protocol.toUpperCase() }}
          </template>
        </el-table-column>
        <el-table-column label="端口" show-overflow-tooltip prop="port"></el-table-column>
        <el-table-column label="间隔（秒）" show-overflow-tooltip prop="intervalInSeconds"></el-table-column>
        <el-table-column label="不正常阈值" show-overflow-tooltip prop="numberOfProbes"></el-table-column>
        <el-table-column label="路径" show-overflow-tooltip prop="protocol">
          <template slot-scope="scope">
            {{ scope.row.requestPath || '--' }}
          </template>
        </el-table-column>
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
import { getProbes, removeProbes } from 'services/platform/azure'
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
      if (data.operate.indexOf('azure.probe') > -1) this.getData()
    },
    remove(data) {
      this.$confirm('此操作将删除探测' + data.name + ', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeProbes(data.id).then(data => {
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
          protocol: data.protocol.toUpperCase(),
          requestPath: data.requestPath,
          port: data.port,
          intervalInSeconds: data.intervalInSeconds,
          numberOfProbes: data.numberOfProbes
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
          protocol: 'TCP',
          port: 80,
          intervalInSeconds: 5,
          numberOfProbes: 2
        }
      }
    },
    getData() {
      getProbes(this.params).then(data => {
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
