<template>
  <div>
    <el-card class="wrapper">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="add()" :disabled="detail.isAllDisabeld"> 新增 </el-button>
        </el-form-item>
      </el-form>
      <basic-table row-key="id" :data="tableData" :params="params" :get-list="getData" :total="total" :otherProps="{ lazy: true, load }">
        <el-table-column label="后端池" show-overflow-tooltip prop="name"></el-table-column>
        <el-table-column label="云主机" show-overflow-tooltip prop="vmName"> </el-table-column>
        <el-table-column label="云主机状态" show-overflow-tooltip prop="status">
          <template slot-scope="scope">
            <status-icon v-if="scope.row.status" :color="scope.row.status | openstackServerColor">{{ scope.row.status | vmStatusFilter }}</status-icon>
          </template>
        </el-table-column>
        <el-table-column label="网络接口" show-overflow-tooltip prop="nicName"></el-table-column>
        <el-table-column label="专用IP地址" show-overflow-tooltip prop="privateIps">
          <template slot-scope="scope">
            <div v-for="(item, index) in scope.row.privateIpsList" :key="index">
              {{ item }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160px" align="center">
          <template slot-scope="scope">
            <el-button type="text" v-if="scope.row.name" :disabled="detail.isAllDisabeld" @click="modify(scope.row)"> <i class="el-icon-edit"></i> 修改 </el-button>
            <el-button type="text" v-if="scope.row.name" :disabled="detail.isAllDisabeld" @click="remove(scope.row)"> <i class="el-icon-delete"></i> 删除 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </el-card>
    <add :add-data="addData" v-if="addData.dialog" @back="$emit('back')"></add>
    <modify :add-data="modifyData" v-if="modifyData.dialog" @back="$emit('back')"></modify>
  </div>
</template>

<script>
import { getBackends, removeBackends } from 'services/platform/azure'
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
      if (data.operate.indexOf('azure.backEnd') > -1) this.getData()
    },
    formatData(data) {
      return data.map(item => {
        const { servers, networkInterfaces, ...others } = item
        servers.forEach((server, index) => {
          server.vmName = server.name
          server.name = ''
          server.privateIpsList = server.privateIps ? JSON.parse(server.privateIps) : []
          server.nicName = networkInterfaces.length ? networkInterfaces[index].name : ''
        })
        let hasChildren
        if (servers.length) {
          hasChildren = true
        } else {
          hasChildren = false
        }
        return {
          ...others,
          servers: servers,
          hasChildren: hasChildren
        }
      })
    },
    async load(tree, treeNode, resolve) {
      resolve(tree.servers)
    },
    remove(data) {
      this.$confirm('此操作将删除后端池' + data.name + ', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeBackends(data.id).then(data => {
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
        regionId: this.detail.regionId,
        data: {
          networkId: '',
          id: data.id,
          vendorId: this.detail.vendorId,
          slbId: this.detail.id,
          name: data.name,
          virtualMachineIds: data.virtualMachineIds ? data.virtualMachineIds : []
        }
      }
    },
    add(data) {
      const server = []
      this.tableData.forEach(item => {
        item.servers.forEach(item1 => {
          server.push(item1)
        })
      })
      this.addData = {
        dialog: true,
        resourceGroupId: this.detail.resourceGroupId,
        azureResourceGroupName: this.detail.groupName,
        vpcUuid: (server.find(item => item.vpcUuid) || {}).vpcUuid || '',
        networkId: (server.find(item => item.vpcUuid) || {}).vpcUuid || '',
        regionId: this.detail.regionId,
        data: {
          vendorId: this.detail.vendorId,
          slbId: this.detail.id,
          name: '',
          virtualMachineIds: []
        }
      }
    },
    getData() {
      getBackends(this.params).then(data => {
        if (data.success) {
          this.tableData = this.formatData(data.data.rows)
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
