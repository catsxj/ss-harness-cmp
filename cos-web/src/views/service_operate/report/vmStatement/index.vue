<template>
  <el-card>
    <div>
      <el-form :inline="true">
        <el-form-item>
          <el-input input-width="100px" placeholder="租户" v-model="searchData.tenantName" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-input input-width="100px" :placeholder="$store.getters.systemConfig.projectConfigLabel" v-model="searchData.projectName" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-input input-width="100px" placeholder="使用人" v-model="searchData.ownerName" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button type="ghost" icon="el-icon-refresh" @click="reset">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" @click="handleExport"> <i class="el-icon-download"></i> 导出 </el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="list" ref="multipleTable" :get-list="getList" :params="params" :total="total" @selection-change="handleSelectionChange">
        <el-table-column prop="name" show-overflow-tooltip label="云主机名称" min-width="200px"></el-table-column>
        <el-table-column show-overflow-tooltip label="云主机类型" prop="vendorType" min-width="200px"></el-table-column>
        <el-table-column label="IP地址" show-overflow-tooltip min-width="200px">
          <template slot-scope="scope" style="width: 100%">
            <div v-if="scope.row.vendorType == 'OPENSTACK' || scope.row.vendorType == 'MANAGEONE' || scope.row.vendorType == 'FUSIONCLOUD'">
              <span v-for="item in JSON.parse(scope.row.privateIps)" :key="item.networkId">
                <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
              </span>
            </div>
            <div v-else-if="scope.row.vendorType == 'VMWARE' || scope.row.vendorType == 'POWERVC' || scope.row.vendorType == 'HUAWEI'">
              <div v-for="item in JSON.parse(scope.row.privateIps)" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'QCLOUD'">
              <div v-for="(item, index) in JSON.parse(scope.row.privateIps)" :key="index">(内网){{ item.address }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'JDCLOUD'">
              <div v-for="(item, index) in JSON.parse(scope.row.privateIps)" :key="index">(内网){{ item }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'CLOUDTOWER'">
              <div v-for="(item, index) in JSON.parse(scope.row.privateIps)" :key="index">
                <span v-if="item.address">(内网)</span>
                <span>
                  {{ item.address }}
                </span>
              </div>
            </div>
            <div v-else-if="scope.row.vendorType == 'INSPURRAIL'">
              <div v-for="(item, index) in JSON.parse(scope.row.privateIps)" :key="index">(内网){{ item }}</div>
            </div>
            <div v-else>
              <div v-for="(item, index) in JSON.parse(scope.row.privateIps)" :key="index">(内网){{ item }}</div>
            </div>
            <div v-if="scope.row.floatingIp">(公网){{ scope.row.floatingIp }}</div>
            <div v-if="scope.row.vendorType == 'TENCENT' || scope.row.vendorType == 'ALIYUN'">
              <div v-for="(item, index) in JSON.parse(scope.row.publicIps)" :key="index">(公网){{ item }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="配置信息" prop="source" min-width="200px">
          <template slot-scope="scope">
            <span>cpu:{{ scope.row.cpu }}C 磁盘: {{ scope.row.disk }}GB 内存: {{ scope.row.memory }}GB</span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="租户" prop="tenantName" min-width="200px"></el-table-column>
        <el-table-column show-overflow-tooltip :label="$store.getters.systemConfig.projectConfigLabel" prop="projectName" min-width="200px"></el-table-column>
        <el-table-column show-overflow-tooltip label="使用人" prop="ownerName" min-width="200px"></el-table-column>
        <el-table-column show-overflow-tooltip label="所属平台" prop="vendorName" min-width="200px"></el-table-column>
      </basic-table>
    </div>
  </el-card>
</template>

<script>
import { statementList } from 'services/platform/index'
import { downloadFile } from 'utils'

export default {
  components: {},
  data() {
    return {
      searchData: {},
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
    reset() {
      this.searchData = {}
      this.handleSearch()
    },
    handleSelectionChange() {},
    handleExport() {
      downloadFile('/rms/v1/reports/vms/download', this.params)
    },
    getList() {
      console.log(11)
      statementList(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'tenantName:LK': this.searchData.tenantName,
        'projectName:LK': this.searchData.projectName,
        'ownerName:LK': this.searchData.ownerName
      })
      this.getList()
    }
  }
}
</script>
