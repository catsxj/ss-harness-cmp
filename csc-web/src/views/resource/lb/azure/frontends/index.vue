<template>
  <div>
    <el-card class="wrapper">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="add()" :disabled="detail.isAllDisabeld"> 新增 </el-button>
          <el-button type="ghost" @click="removes" :disabled="selectList.length == 0 || detail.isAllDisabeld"> 删除 </el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="tableData" :params="params" :get-list="getData" :total="total" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
        <el-table-column type="selection"></el-table-column>
        <el-table-column label="名称" show-overflow-tooltip prop="name"></el-table-column>
        <el-table-column label="IP地址" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.frontEndType == 'EXTERNAL'">{{ scope.row.publicIpAddress }}</span>
            <span v-else>{{ scope.row.privateIpAddress }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" show-overflow-tooltip prop="gmtCreate"></el-table-column>
        <el-table-column label="操作" width="160px" align="center">
          <template slot-scope="scope">
            <el-button type="text" :disabled="detail.isAllDisabeld" @click="remove(scope.row)"> <i class="el-icon-delete"></i> 删除 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </el-card>
    <add :add-data="addData" v-if="addData.dialog" @back="$emit('back')"></add>
  </div>
</template>

<script>
import { getFrontends, removeFrontends, removFrontend } from 'services/platform/azure'
import add from './add.vue'
import webSocket from '@/common/mixins/webSocket'

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
      },
      idList: [],
      selectList: []
    }
  },
  methods: {
    removes() {
      this.$confirm('该操作为不可逆操作，确定后将永久删除所选前端IP配置，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.refreshId()
        removFrontend({ ids: this.idList }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getData()
          }
        })
      })
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    // 单选
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id == row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    // 全选
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.tableData.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id == row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    onmessage(data) {
      if (data.operate.indexOf('azure.frontEnd') > -1) this.getData()
    },
    remove(data) {
      this.$confirm('此操作将删除前端配置' + data.name + ', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeFrontends(data.id).then(data => {
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
        resourceGroupId: this.detail.resourceGroupId,
        regionId: this.detail.regionId,
        data: {
          vendorId: this.detail.vendorId,
          slbId: this.detail.id,
          ipList: { name: '', frontEndType: this.detail.slbType }
        }
      }
      if (this.detail.slbType == 'INTERNAL') {
        this.$set(this.addData.data.ipList, 'publicIpId', '')
      } else {
        // this.$set(this.addData.data.ipList, 'vpcId', this.detail.vpcId)
        this.$set(this.addData.data.ipList, 'vpcId', '')
        this.$set(this.addData.data.ipList, 'subnetId', '')
      }
    },
    getData() {
      getFrontends(this.params).then(data => {
        if (data.success) {
          this.selectList = []
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
  watch: {
    detail() {
      this.handleSearch()
    }
  }
}
</script>

<style></style>
