<template>
  <div class="wrapper">
    <div>
      <el-form :inline="true">
        <el-form-item>
          <el-input class="search-item" placeholder="名称" v-model="listQuery.name"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-input placeholder="IP" v-model="listQuery.privateIps"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button
            type="ghost"
            icon="el-icon-refresh-left"
            @click="
              () => {
                listQuery = {}
                handleSearch()
              }
            "
            >刷新</el-button
          >
        </el-form-item>
      </el-form>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total">
        <el-table-column label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" @click="$router.push({ name: 'ServiceEcs', query: { id: scope.row.id } })" :disabled="scope.row.status == 'BUILDING'">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="IP" prop="address" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.vendorType == 'OPENSTACK' || scope.row.vendorType == 'EASYSTACK' || scope.row.vendorType == 'MANAGEONE' || scope.row.vendorType == 'FUSIONCLOUD'">
              <span v-for="item in scope.row.privateIpsList" :key="item.networkId">
                <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
              </span>
            </div>
            <div v-else-if="scope.row.vendorType == 'VMWARE' || scope.row.vendorType == 'INSPURRAIL' || scope.row.vendorType == 'CNWARE' || scope.row.vendorType == 'ZSTACK' || scope.row.vendorType == 'CECSTACK' || scope.row.vendorType == 'H3C'">
              <div v-for="item in scope.row.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'HUAWEI' || scope.row.vendorType == 'HCSO'">
              <div v-for="item in scope.row.privateIpsList" :key="item.address">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'QCLOUD'">
              <div v-for="(item, index) in scope.row.privateIpsList" :key="index">(内网){{ item.address }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'AZURE' || scope.row.vendorType == 'AWS'">
              <div v-for="item in scope.row.privateIpsList" :key="item">(内网){{ item }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'JDCLOUD'">
              <div v-for="(item, index) in scope.row.privateIpsList" :key="index">(内网){{ item }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'VOLCENGINE'">
              <!-- <div v-for="(item, index) in scope.row.privateIpsList" :key="index">(内网){{ item.primaryIpAddress }}</div> -->
              <div v-if="JSON.parse(scope.row.privateIps)[0].primaryIpAddress">{{ JSON.parse(scope.row.privateIps)[0].primaryIpAddress }}(内网)</div>
              <div v-if="JSON.parse(scope.row.privateIps)[0].eipAddress">{{ JSON.parse(scope.row.privateIps)[0].eipAddress }}(公网)</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'SMARTX' || scope.row.vendorType == 'CLOUDTOWER'">
              <div>{{ scope.row.managerIp ? '(内网)' + scope.row.managerIp : '--' }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'SANGFOR'">
              <div>{{ scope.row.privateIps }}</div>
            </div>
            <div v-else>
              <div v-for="item in scope.row.privateIpsList" :key="item">(内网){{ item }}</div>
            </div>
            <div v-if="scope.row.floatingIp">(公网){{ scope.row.floatingIp }}</div>
            <div v-if="scope.row.vendorType == 'CNWARE' || scope.row.vendorType == 'CECSTACK'">
              <div v-for="(item, index) in scope.row.publicIps" :key="index">(公网){{ item.address }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" prop="status" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :color="scope.row.status | openstackServerColor">{{ scope.row.status | openstackServer }} </status-icon>
          </template>
        </el-table-column>
        <el-table-column label="操作系统及版本" prop="createTime" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>
              {{ scope.row.osName || scope.row.osVersion ? (scope.row.osName ? scope.row.osName : '') + ' ' + (scope.row.osVersion ? scope.row.osVersion : '') : scope.row.osCategory }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="regionId" label="区域" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.regionName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip></el-table-column>
      </basic-table>
    </div>
  </div>
</template>

<script>
import { getVm } from 'services/platform/index'
export default {
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listQuery: {
        name: ''
      },
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
      getVm(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.selectList = []
          this.list.forEach(item => {
            if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
            if (item.publicIps) item.publicIps = JSON.parse(item.publicIps)
          })
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.formatSearchParam({
        lkParam: {
          name: this.listQuery.name,
          publicIps: this.listQuery.privateIps
        }
      })
      const object = JSON.parse(this.params.params)
      object.push({ param: { isRecycle: 0, availabilitySetId: this.detail.id }, sign: 'EQ' })
      this.params.params = JSON.stringify(object)
      this.getList()
    }
  }
}
</script>
<style scoped></style>
