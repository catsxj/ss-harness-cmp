<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="add()"> 新增 </el-button>
      </el-form-item>
    </el-form>
    <basic-table row-key="id" :data="tableData" :params="params" :get-list="getData" :total="total" :otherProps="{ lazy: true, load }">
      <el-table-column label="名称" show-overflow-tooltip prop="name"></el-table-column>
      <el-table-column label="类型" show-overflow-tooltip prop="name">
        <template slot-scope="scope">
          {{ scope.row.isPrimary ? '主要' : '辅助' }}
        </template>
      </el-table-column>
      <el-table-column label="分配" show-overflow-tooltip prop="name">
        <template slot-scope="scope">
          {{ ipMethodFilter[scope.row.ipMethod] }}
        </template>
      </el-table-column>
      <el-table-column label="专用IP地址" show-overflow-tooltip prop="privateIpAddress"></el-table-column>
      <el-table-column label="公共IP地址" show-overflow-tooltip prop="publicIpAddress"></el-table-column>
      <el-table-column label="操作" width="220px" align="center">
        <template slot-scope="scope">
          <el-button type="text" :disabled="scope.row.isPrimary || detail.locked" @click="remove(scope.row)"> 删除 </el-button>
          <el-button v-if="scope.row.publicIpAddressId" :disabled="detail.locked" type="text" @click="publicIp(scope.row)">卸载弹性IP</el-button>
          <el-button v-else type="text" :disabled="detail.locked" @click="publicIp(scope.row)">绑定弹性IP</el-button>
          <el-button type="text" :disabled="detail.locked" @click="modify(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </basic-table>
    <add :add-data="addData" v-if="addData.dialog" @back="$emit('back')"></add>
    <modify :add-data="modifyData" v-if="modifyData.dialog" @back="$emit('back')"></modify>
    <bind :add-data="publicData" v-if="publicData.dialog" @back="getData"></bind>
  </div>
</template>

<script>
import { getNicsIp, removeNicsIp, patchNicsIp, createNicsIp } from 'services/platform/azure'
import add from './add.vue'
import modify from './modify.vue'
import webSocket from '@/common/mixins/webSocket'
import bind from './bind.vue'
export default {
  components: { add, bind, modify },
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
      },
      publicData: {
        dialog: false,
        data: {}
      },
      loading: false,
      ipMethodFilter: {
        Dynamic: '动态',
        Static: '静态'
      }
    }
  },
  methods: {
    publicIp(data) {
      if (data.publicIpAddressId) {
        this.$confirm('此操作将解绑弹性IP, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          patchNicsIp('detachPublicIp', { id: data.id, publicIPAddress: data.publicIPAddress }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.getData()
            }
          })
        })
      } else {
        this.publicData = {
          dialog: true,
          data: {
            ...this.detail,
            id: data.id
          }
        }
      }
    },
    onmessage(data) {
      if (data.operate.indexOf('azure') > -1) this.getData()
    },
    async load(tree, treeNode, resolve) {
      resolve(tree.servers)
    },
    remove(data) {
      this.$confirm('此操作将删除IP配置' + data.name + ', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeNicsIp(data.id).then(data => {
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
    add() {
      this.addData = {
        dialog: true,
        data: {
          vendorId: this.detail.vendorId,
          networkInterfaceId: this.detail.id,
          resourceGroupId: this.detail.resourceGroupId,
          regionId: this.detail.regionId
        }
      }
      // this.loading = true
      // createNicsIp({
      //   nicIpConfiguration: {
      //     vendorId: this.detail.vendorId,
      //     networkInterfaceId: this.detail.id,
      //     resourceGroupId: this.detail.resourceGroupId,
      //     regionId: this.detail.regionId,
      //     name: 'aaaa'
      //   }
      // }).then(data => {
      //   if (data.success) {
      //     this.$message({
      //       type: 'success',
      //       message: data.message
      //     })
      //     this.getData()
      //   }
      // })
    },
    modify(data) {
      this.modifyData = {
        dialog: true,
        data: {
          id: data.id,
          ipMethod: data.ipMethod,
          privateIpAddress: data.privateIpAddress ? data.privateIpAddress : ''
        }
      }
    },
    getData() {
      getNicsIp(this.params).then(data => {
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
          networkInterfaceId: this.detail.id
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
