<template>
  <el-card class="wrapper">
    <div>
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="名称" v-model="searchData.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select clearable filterable v-model="searchData.vendorType" placeholder="平台类型">
            <el-option v-for="(item, index) in vendorList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button type="ghost" icon="el-icon-refresh" @click="handleReSet">重置</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="tableData" :params="params" :get-list="getList" :total="total" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
        <el-table-column type="selection"> </el-table-column>
        <el-table-column label="名称" show-overflow-tooltip prop="name">
          <template slot-scope="scope">
            <span class="detail-href" @click="getDetail(scope.row)">{{ scope.row.name }}</span>
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
            <status-icon :type="scope.row.status | openstackServerColor">{{ scope.row.status | openstackServer }} </status-icon>
          </template>
        </el-table-column>
        <el-table-column label="配置" prop="hostConfig" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作系统及版本" prop="createTime" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.vendorType == 'OPENSTACK'">{{ (scope.row.osCategory ? scope.row.osCategory : '') + ' ' + (scope.row.osVersion ? scope.row.osVersion : '') }}</span>
            <span v-else>{{ (scope.row.osName ? scope.row.osName : '') + ' ' + (scope.row.osVersion ? scope.row.osVersion : '') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="云平台类型" prop="vendorType" show-overflow-tooltip></el-table-column>
        <el-table-column label="过期时间" prop="expiredTime" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.expiredTime ? (scope.row.expiredTime.indexOf('2099') > -1 ? '无限期' : scope.row.expiredTime) : scope.row.expiredTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template slot-scope="scope">
            <el-button type="text" @click="handleMonitorDetail(scope.row.id, scope.row.name, scope.row.vendorType)"> 告警详情</el-button>
            <div class="action-divider"></div>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleLink(scope.row)"> 关联规则 </el-dropdown-item>
                <el-dropdown-item @click.native="handlePolicy(scope.row)">
                  {{ `${scope.row.alarmEnable ? '屏蔽' : '开启'}告警` }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </basic-table>
      <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
      <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
        <el-card slot="custom_content">
          <detail-vc v-if="detailData.vendorType == 'VMWARE' && detailFlag" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :detail-data="detailData" :bios-uuid="biosUuid"></detail-vc>
          <detail-op v-if="detailData.vendorType == 'OPENSTACK' && detailFlag" :detail-id="detailId" :identifier="identifier" :detail-data="detailData" @goBack="goBack"></detail-op>
          <detail-mo v-if="detailData.vendorType == 'MANAGEONE' && detailFlag" :detail-id="identifier" :detail-data="detailData" @goBack="goBack"></detail-mo>
          <detail-aliyun v-if="detailData.vendorType == 'ALIYUN' && detailFlag" :detail-id="detailId" :instance-id="identifier" @goBack="goBack"></detail-aliyun>
          <detail-huawei v-if="detailData.vendorType == 'HUAWEI' && detailFlag" :detail-id="detailId" :instance-id="identifier" @goBack="goBack"></detail-huawei>
          <detail-smartx v-if="detailData.vendorType == 'SMARTX' && detailFlag" :detail-id="detailId" :instance-id="identifier" @goBack="goBack"></detail-smartx>
          <zstack-detail v-if="detailData.vendorType == 'ZSTACK' && detailFlag" :detail-id="detailId" :instance-id="identifier"></zstack-detail>
          <h3c-detail v-if="detailData.vendorType == 'H3C'" :detail-id="detailId" :instance-id="instanceId" :identifier="identifier"></h3c-detail>
          <cnware-detail v-if="detailData.vendorType == 'CNWARE'" :detail-id="detailId" :detailUuid="identifier" :detailVendorId="detailVendorId"></cnware-detail>
          <cloudtower-detail v-if="detailData.vendorType == 'CLOUDTOWER'" :detail-id="detailId" :detailUuid="identifier" :detailVendorId="detailVendorId"></cloudtower-detail>
        </el-card>
      </common-detail>
    </div>
  </el-card>
</template>

<script>
import { getPolicyVms, getRuleGroupBind } from 'services/monitor/index.js'
import detailVc from 'views/monitor/virtual/vcenter/vm.vue'
import detailOp from 'views/monitor/virtual/openstack/index.vue'
import detailMo from 'views/monitor/virtual/manageone/index.vue'
import detailAliyun from 'views/monitor/virtual/aliyun/detail.vue'
import detailHuawei from 'views/monitor/virtual/huawei/detail.vue'
import detailSmartx from 'views/monitor/virtual/smartx/detail.vue'
import zstackDetail from 'views/monitor/virtual/zstack/VmDetail.vue'
import h3cDetail from 'views/monitor/virtual/h3c/vm_detail.vue'
import cnwareDetail from 'views/monitor/virtual/cnware/vm_detail.vue'
import cloudtowerDetail from 'views/monitor/virtual/cloudTower/vm_detail.vue'
import addPolicy from 'views/monitor/components/linkPolicy'
import { conditionCloudVendor } from 'services/platform/index'
import { handleStart } from 'views/monitor/data'
export default {
  components: {
    detailVc,
    detailOp,
    detailMo,
    detailAliyun,
    detailHuawei,
    detailSmartx,
    h3cDetail,
    cnwareDetail,
    cloudtowerDetail,
    addPolicy,
    zstackDetail
  },
  data() {
    return {
      handleStart,
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: '',
        vendorType: ''
      },
      vendorList: [
        { name: 'VMWARE', value: 'VMWARE' },
        { name: 'CNWARE', value: 'CNWARE' },
        { name: '紫光云', value: 'H3C' },
        // { name: 'ALIYUN', value: 'ALIYUN' },
        // { name: 'OPENSTACK', value: 'OPENSTACK' },
        // { name: 'HUAWEI', value: 'HUAWEI' },
        // { name: 'SMARTX', value: 'SMARTX' },
        // { name: 'ZSTACK', value: 'ZSTACK' },
        { name: 'CLOUDTOWER', value: 'CLOUDTOWER' }
      ],
      tableData: [],
      total: 0,
      idList: [],
      selectList: [],
      projectId: null,
      loading: false,
      detailData: {},
      identifier: '',
      instanceId: '',
      detailVendorId: '',
      detailId: null,
      detailFlag: false,
      hostName: '',
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: '',
      biosUuid: ''
    }
  },
  methods: {
    handleClick() {
      this.searchData = {
        name: ''
      }
      this.selectList = []
    },
    changeVendorId() {
      this.handleSearch()
    },
    getList() {
      this.refreshId()
      getPolicyVms(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
          this.tableData.forEach(item => {
            const self = this
            item.privateIpsList = item.privateIps ? JSON.parse(item.privateIps) : []
            item.hostConfig = item.cpu + 'C/' + item.memory + 'GB/' + (item.disk ? item.disk : 0) + 'GB'
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.resourceMonitorTable.$refs.basicTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
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
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        this.tableData.forEach(item => {
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
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    handleSearch() {
      this.params.page = 1
      let type = ''
      if (!this.searchData.vendorType) {
        type = '"ALIYUN","VMWARE","OPENSTACK","HUAWEI", "SMARTX", "CLOUDTOWER", "ZSTACK","H3C","CNWARE"'
      } else {
        type = ''
      }
      this.params.params = this.$tools.handleSearchParam({
        'vendorType:in': type,
        vendorType: this.searchData.vendorType,
        isRecycle: 0,
        name: this.searchData.name
      })
      this.getList()
    },
    handleReSet() {
      this.searchData = { name: '', vendorType: '' }
      this.handleSearch()
    },
    handleLink(data) {
      this.ruleGroupIds = []
      this.resourceId = data.id
      this.resourceType = data.vendorType == 'VMWARE' ? 'MONITOR_VCENTER_VM' : `MONITOR_${data.vendorType}_VM`
      getRuleGroupBind(data.id).then(data => {
        if (data.success) {
          this.ruleGroupIds = data.data
          this.addFlag = true
        }
      })
    },
    cancle() {
      this.addFlag = false
      this.getList()
    },
    handlePolicy(data) {
      this.resourceType = data.vendorType == 'VMWARE' ? 'MONITOR_VCENTER_VM' : `MONITOR_${data.vendorType}_VM`
      this.handleStart(this, data, this.resourceType)
    },
    handleMonitorDetail(id, name, vendorType) {
      let type = ''
      if (vendorType == 'OPENSTACK') {
        type = 'MONITOR_OPENSTACK_VM'
      } else if (vendorType == 'VMWARE') {
        type = 'MONITOR_VCENTER_VM'
      } else if (vendorType == 'ALIYUN') {
        type = 'MONITOR_ALIYUN_VM'
      } else if (vendorType == 'HUAWEI') {
        type = 'MONITOR_HUAWEI_VM'
      } else if (vendorType == 'SMARTX') {
        type = 'MONITOR_SMARTX_VM'
      } else if (vendorType == 'CLOUDTOWER') {
        type = 'MONITOR_CLOUDTOWER_VM'
      } else {
        type = 'MONITOR_FUSIONCLOUD_VM'
      }
      this.$router.push({
        name: 'MonitorDetailList',
        query: { id: id, name: name, type: type }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    getDetail(row) {
      this.detailId = row.id
      switch (row.vendorType) {
        case 'VMWARE':
          this.identifier = row.name
          this.hostName = row.hostName
          this.biosUuid = row.biosUuid
          break
        case 'OPENSTACK':
          this.identifier = row.instanceId
          break
        case 'MANAGEONE':
          this.identifier = row.instanceId
          break
        case 'ALIYUN':
          this.identifier = row.instanceId
          break
        case 'H3C':
          this.instanceId = row.instanceId
          this.identifier = row.name
          break
        case 'CNWARE':
          this.identifier = row.instanceId
          this.detailVendorId = row.vendorId
          break
        default:
          this.identifier = row.instanceId
          break
      }
      this.detailData = Object.assign({}, row)
      this.detailFlag = true
    }
  },
  created() {
    this.handleSearch()
    this.projectId = localStorage.getItem('projectId') || 0
    // this.handleClick();
  }
}
</script>
