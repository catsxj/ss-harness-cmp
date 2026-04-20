<template>
  <div class="wrapper">
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="containerMonitorTable">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #privateIps="privateIps">
        <span v-for="item in privateIps" :key="item.networkId">
          <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
        </span>
      </template>
      <template #status="status">
        <status-icon :type="vmStatusColorFilter(status)">
          {{ openstackServerFilter(status) }}
        </status-icon>
      </template>
      <template #spec="val, record"> {{ record.cpu + 'C/' + record.memory + 'GB/' }}{{ record.disk == null ? 0 : record.disk + 'GB' }} </template>
      <template #cpuUsage="cpuUsage">
        <el-progress class="progress" :color="customColorMethod" text-inside :stroke-width="16" :percentage="cpuUsage ? cpuUsage : 0"></el-progress>
      </template>
      <template #memUsage="memUsage">
        <el-progress class="progress" :color="customColorMethod" text-inside :stroke-width="16" :percentage="memUsage ? memUsage : 0"></el-progress>
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
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <el-card>
          <el-tabs v-model="detailActiveName" class="m-t-n-md">
            <el-tab-pane name="overview">
              <span slot="label">资源总览</span>
              <overview ref="overview" v-if="detailActiveName == 'overview'" :detail-id="detailId" :detail-data="detailData"></overview>
            </el-tab-pane>
            <el-tab-pane name="cpu">
              <span slot="label">CPU</span>
              <cpu ref="cpu" v-if="detailActiveName == 'cpu'" :detail-id="detailId"></cpu>
            </el-tab-pane>
            <el-tab-pane name="mem">
              <span slot="label">内存</span>
              <mem ref="mem" v-if="detailActiveName == 'mem'" :detail-id="detailId"></mem>
            </el-tab-pane>
            <el-tab-pane name="net">
              <span slot="label">网络</span>
              <net ref="net" v-if="detailActiveName == 'net'" :detail-id="detailId"></net>
            </el-tab-pane>
            <el-tab-pane name="clouddisk">
              <span slot="label">云硬盘</span>
              <cloud-disk ref="clouddisk" v-if="detailActiveName == 'clouddisk'" :detail-id="detailId"></cloud-disk>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { vmStatusColorFilter, openstackServerFilter } from '@/filters/index'
import { getVms, getRuleGroupBind } from 'services/monitor/index.js'
import overview from './vm_overview.vue'
import cpu from './vm_cpu.vue'
import mem from './vm_memory.vue'
import cloudDisk from './vm_cloud_disk.vue'
import net from './vm_net.vue'
import { customColorMethod, handleStart } from 'views/data'
import addPolicy from 'views/components/linkPolicy.vue'
const columns = [
  {
    type: 'selection',
    disabled: true
  },
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: 'IP地址',
    prop: 'privateIps',
    scopedSlots: { customRender: 'privateIps' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '规格',
    prop: 'spec',
    scopedSlots: { customRender: 'spec' }
  },
  {
    label: 'CPU利用率',
    prop: 'cpuUsage',
    scopedSlots: { customRender: 'cpuUsage' }
  },
  {
    label: '内存利用率',
    prop: 'memUsage',
    scopedSlots: { customRender: 'memUsage' }
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '160px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: {
    overview,
    cpu,
    mem,
    cloudDisk,
    net,
    addPolicy
  },
  data() {
    return {
      vmStatusColorFilter,
      openstackServerFilter,
      columns,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId },
        { type: 'Const', value: 'vendorType', initValue: 'MANAGEONE' }
      ],
      customColorMethod,
      handleStart,
      params: {
        page: 1,
        rows: 10
      },
      vendorData: [],
      list: [],
      total: 0,
      idList: [],
      selectList: [],
      detailFlag: false,
      detailData: {},
      detailId: null,
      detailActiveName: 'overview',
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_FUSIONCLOUD_VM'
    }
  },
  methods: {
    getList() {
      this.loading = true
      this.refreshId()
      getVms(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            if (item.privateIps) item.privateIps = JSON.parse(item.privateIps)
            const self = this
            setTimeout(() => {
              if (self.idList.indexOf(item.id) > -1) self.$refs.containerMonitorTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
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
        selection.forEach((item) => {
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
      this.detailData = Object.assign({}, row)
      this.detailId = row.instanceId
      this.detailFlag = true
    },
    goBack() {
      this.detailFlag = false
    },
    handleMonitorDetail(id, name) {
      this.$router.push({
        name: 'MonitorDetailList',
        query: { id: id, name: name, type: this.resourceType }
      })
    }
  },
  created() {}
}
</script>
