<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="IP" v-model="searchData.ip"></el-input>
      </el-form-item>
      <el-form-item>
        <el-select clearable v-model="searchData.clusterId" placeholder="主机组" @change="changeCluster">
          <el-option v-for="item in clusterData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select clearable v-model="searchData.hostId" placeholder="宿主机" @change="handleSearch">
          <el-option v-for="(item, index) in hostData" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select clearable v-model="searchData.status" placeholder="状态" @change="handleSearch">
          <el-option v-for="(item, index) in statusData" :key="index" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="ghost" icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    <AdvanceTable title="" :data="list" :params="params" :columns="vmColumns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
      <!-- 无所属租户 -->
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #privateIps="privateIps, record">
        <div>
          <span v-for="item in privateIps" :key="item.networkId">
            <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </span>
        </div>
        <div v-if="record.floatingIp">(公网){{ record.floatingIp }}</div>
      </template>
      <template #status="status">
        <status-icon :type="vmStatusColorFilter(status)">{{ vmStatusFilter(status) }} </status-icon>
      </template>
      <template #cpuUsage="cpuUsage">
        <el-progress class="progress" :color="customColorMethod" text-inside :stroke-width="16" :percentage="Number(cpuUsage) ? Number(cpuUsage) : 0"></el-progress>
      </template>
      <template #memUsage="memUsage">
        <el-progress class="progress" :color="customColorMethod" text-inside :stroke-width="16" :percentage="Number(memUsage) ? Number(memUsage) : 0"></el-progress>
      </template>
      <template #memTotal="memTotal">
        {{ memTotal == 'null' ? 0 : memTotal }}
      </template>
      <template #onOffStatus="onOffStatus">
        <status-icon :type="statusOnColorFilter(onOffStatus)">
          {{ onOffStatus }}
        </status-icon>
      </template>
      <template #responseTime="responseTime">
        <span v-if="responseTime">{{ responseTime }}ms</span>
        <span v-else>未知</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleMonitorDetail(record.id, record.name)"> 告警详情</el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleLink(record.id)"> 关联规则 </el-dropdown-item>
            <el-dropdown-item @click.native="handlePolicy(record)">
              {{ `${record.alarmEnable ? '屏蔽' : '开启'}告警` }}
            </el-dropdown-item>
            <el-dropdown-item @click.native="setIP(record)"> 设置监控IP </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
    <el-dialog title="设置监控IP" :visible.sync="setIPFlag" v-if="setIPFlag">
      <el-row>
        <basic-form ref="setData" :model="setData" :status-icon="true">
          <el-col :span="24">
            <basic-form-item label="IP地址：" prop="ip" validate="required">
              <el-select clearable v-model="setData.ip">
                <el-option v-for="(item, index) in ipData" :key="index" :label="item" :value="item"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </basic-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="setIPFlag = false">取 消</el-button>
        <el-button type="primary" @click.native="setSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <el-card>
          <el-tabs v-model="detailActiveName" class="m-t-n-md">
            <el-tab-pane name="overview">
              <span slot="label">资源总览</span>
              <detail v-if="detailActiveName == 'overview'" :detail-id="detailId" :instance-id="instanceId"></detail>
              <!-- <overview ref="overview" v-if="detailActiveName=='overview'" :detail-id="detailId" :instance-id="instanceId"></overview> -->
            </el-tab-pane>
            <el-tab-pane name="network">
              <span slot="label">网络安全组</span>
              <network ref="network" v-if="detailActiveName == 'network'" @getNetDetail="getNetDetail" :detail-id="detailId"></network>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </common-detail>
    <common-detail v-if="detailNetFlag" :title="detailNet.name" @goBack="goBackNet">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailNet.name }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailNet.createTime }}</common-detail-item>
        <common-detail-item label="描述">{{ detailNet.remark }}</common-detail-item>
        <common-detail-item label="所属平台">{{ detailNet.vendorName }}</common-detail-item>
        <common-detail-item label="所属租户">{{ detailNet.tenantName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel">{{ detailNet.projectName }}</common-detail-item>
        <common-detail-item label="安全组UUID">{{ detailNet.groupUuid }}</common-detail-item>
      </template>
      <el-tabs value="second">
        <el-tab-pane label="规则列表" name="second">
          <basic-table :data="ruleDetailData" :params="paramd" :get-list="getDetailHost" :total="ruleDetailTotal">
            <el-table-column prop="name" label="IP协议" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ secruityProtocolFilter(scope.row.protocol) }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="方向" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ securityGroupFilter(scope.row.direction) }}
              </template>
            </el-table-column>
            <el-table-column prop="tenantName" label="以太网类型" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ etherTypeFilter(scope.row.etherType) }}
              </template>
            </el-table-column>
            <el-table-column prop="portMin" label="起始端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="portMax" label="结束端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="tenantName" label="远端IP前缀" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.remoteIpPrefix || (scope.row.etherType == 'IPv6' ? '::/0' : '0.0.0.0/0') }}
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </div>
</template>

<script>
import { securityGroupFilter, statusOnColorFilter, etherTypeFilter, vmStatusFilter, vmStatusColorFilter, secruityProtocolFilter } from '@/filters/index'
import { getVms, setIps, getRuleGroupBind } from 'services/monitor/index.js'
import { getGroupRule, getHost, getCluters } from 'services/platform/index'
import network from './vm_network.vue'
import detail from './vm_detail.vue'
import { vmColumns, customColorMethod, handleStart } from 'views/data'
import addPolicy from 'views/components/linkPolicy'

const statusData = [
  { value: 'RUNNING', name: '运行中' },
  { value: 'BUILDING', name: '创建中' },
  { value: 'STOPPED', name: '关机' },
  { value: 'SUSPENDED', name: '挂起' },
  { value: 'EXCEPTION', name: '异常' },
  { value: 'UNKNOWN', name: '断开' }
]
export default {
  components: {
    detail,
    network,
    addPolicy
    // overview
  },
  data() {
    return {
      securityGroupFilter,
      statusOnColorFilter,
      etherTypeFilter,
      vmStatusFilter,
      vmStatusColorFilter,
      secruityProtocolFilter,
      vmColumns,
      customColorMethod,
      handleStart,
      statusData,
      params: {
        page: 1,
        rows: 10
      },
      searchData: {},
      list: [],
      total: 0,
      idList: [],
      selectList: [],
      detailFlag: false,
      detailData: {},
      detailId: null,
      instanceId: null,
      detailActiveName: 'overview',
      detailNetFlag: false,
      ruleDetailData: [],
      ruleDetailTotal: 0,
      paramd: {
        page: 1,
        rows: 10
      },
      detailNet: '',
      hostData: [],
      clusterData: [],
      setData: {},
      ipData: [],
      setIPFlag: false,
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_EASYSTACK_VM'
    }
  },
  methods: {
    getClusterData() {
      getCluters({
        simple: true,
        params: JSON.stringify([
          {
            param: { vendorId: this.$route.query.vendorId },
            sign: 'EQ'
          }
        ])
      }).then((data) => {
        if (data.success) {
          this.clusterData = data.data.rows
        }
      })
    },
    changeCluster(value) {
      if (value) {
        getHost({
          simple: true,
          type: 'Host',
          params: JSON.stringify([
            {
              param: { vendorId: this.$route.query.vendorId, clusterId: value },
              sign: 'EQ'
            }
          ])
        }).then((data) => {
          if (data.success) {
            this.hostData = data.data.rows
            this.handleSearch()
          }
        })
      } else {
        this.getHostData()
        this.handleSearch()
      }
    },
    getHostData() {
      getHost({
        simple: true,
        type: 'Host',
        params: JSON.stringify([
          {
            param: { vendorId: this.$route.query.vendorId },
            sign: 'EQ'
          }
        ])
      }).then((data) => {
        if (data.success) {
          this.hostData = data.data.rows
        }
      })
    },
    getList() {
      this.loading = true
      this.refreshId()
      getVms(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            if (item.privateIps) {
              item.privateIps = JSON.parse(item.privateIps)
            }
            switch (item.onOffStatus) {
              case '0':
                item.onOffStatus = '断开'
                break
              case '1':
                item.onOffStatus = '正常'
                break
              default:
                item.onOffStatus = '未知'
                break
            }
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.resourceMonitorTable.toggleRowSelection(item, true)
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
        this.list.forEach((item) => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach((item) => {
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
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
    },
    handleReset() {
      this.searchData = {}
      this.handleSearch()
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        vendorType: 'EASYSTACK',
        vendorId: this.$route.query.vendorId,
        hostId: this.searchData.hostId,
        status: this.searchData.status,
        isTemplate: false,
        clusterId: this.searchData.clusterId,
        'name:LK': this.searchData.name,
        'privateIps:LK': this.searchData.ip
      })
      this.getList()
    },
    handleLink(id) {
      this.ruleGroupIds = []
      this.resourceId = id
      getRuleGroupBind(id).then((data) => {
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
      this.handleStart(this, data, this.resourceType)
    },
    getDetail(row) {
      this.detailId = row.id
      this.instanceId = row.instanceId
      this.detailData = {
        name: row.name
      }
      this.detailActiveName = 'overview'
      this.detailFlag = true
    },
    goBack() {
      this.detailFlag = false
    },
    handleMonitorDetail(id, name) {
      sessionStorage.setItem('monitorVm', '1')
      this.$router.push({
        name: 'MonitorDetailList',
        query: { id: id, name: name, type: this.resourceType }
      })
    },
    getNetDetail(data) {
      this.detailFlag = false
      this.detailNet = data
      console.log(this.detailNet)
      this.getDetailHost(1)
      this.detailNetFlag = true
    },
    getDetailHost(page) {
      this.paramd.page = page || this.paramd.page
      this.paramd.params = JSON.stringify([
        {
          param: {
            groupId: this.detailNet.id,
            vendorId: this.detailNet.vendorId
          },
          sign: 'EQ'
        }
      ])
      getGroupRule(this.paramd).then((data) => {
        if (data.success) {
          this.ruleDetailData = data.data.rows
          this.ruleDetailTotal = data.data.total
        }
      })
    },
    goBackNet() {
      this.detailNetFlag = false
      this.detailFlag = true
      this.detailActiveName = 'network'
    },
    setIP(row) {
      this.setData = {
        id: row.id,
        ip: row.monitorIp
      }
      this.ipData = []
      row.privateIps.forEach((item1) => {
        item1.addresses.forEach((item2) => {
          this.ipData.push(item2.address)
        })
      })
      if (row.floatingIp) {
        this.ipData.push(row.floatingIp)
      }
      this.setIPFlag = true
    },
    setSubmit() {
      this.$refs.setData.validate((valid) => {
        if (valid) {
          setIps(this.setData).then((data) => {
            this.$notify({
              message: data.message,
              type: 'success'
            })
            this.setIPFlag = false
            this.getList()
          })
        }
      })
    }
  },
  created() {
    this.getHostData()
    this.getClusterData()
    this.handleSearch()
  }
}
</script>
