<template>
  <div>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" ref="resourceMonitorTable">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #privateIps="privateIps, record">
        <div v-for="item in record.privateIps" :key="item">(私网){{ item }}</div>
        <div v-for="(item, index) in JSON.parse(record.publicIps || '[]')" :key="index">(云内IP){{ item }}</div>
      </template>
      <template #status="status">
        <status-icon :type="vmStatusColorFilter(status)">
          {{ openstackServerFilter(status) }}
        </status-icon>
      </template>
      <template #spec="val, record"> {{ (record.cpu ? record.cpu : 0) + 'C/' + (record.memory ? record.memory : 0) + 'GB/' }}{{ record.disk == null ? 0 : record.disk + 'GB' }} </template>
      <template #system="val, record">
        <div>
          {{ (record.osCategory ? record.osCategory : '') + ' ' + (record.osName ? record.osName : '') + ' ' + (record.osVersion ? record.osVersion : '') }}
        </div>
      </template>
      <template #cpuUsage="cpuUsage">
        <el-progress class="progress" :color="customColorMethod" text-inside :stroke-width="16" :percentage="cpuUsage ? cpuUsage : 0"></el-progress>
      </template>
      <template #memUsage="memUsage">
        <el-progress class="progress" :color="customColorMethod" text-inside :stroke-width="16" :percentage="memUsage ? memUsage : 0"></el-progress>
      </template>
      <template #operate="val, record">
        <cb-link @click="handleMonitorDetail(record.id, record.name)"> 告警详情</cb-link>
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
    <common-detail v-if="visible" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane v-for="(tab, index) in Object.keys(vmData)" :key="index" :name="`${index + 1}`" :label="tab">
              <Detail :detail-id="detailData.id" :instance-id="detailData.instanceId" :typeData="vmData[tab]" v-if="activeTab == index + 1" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </common-detail>
    <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
  </div>
</template>
<script>
import { vmStatusColorFilter, openstackServerFilter } from '@/filters/index'
import { getVms, getRuleGroupBind } from 'services/monitor/index.js'
import { customColorMethod, handleStart } from 'views/data'
import { getMonitorList } from '@/services/monitor/configs'
import Detail from './detail.vue'
import addPolicy from 'views/components/linkPolicy.vue'
import { vmData } from './data'
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
    label: '操作系统',
    prop: 'system',
    scopedSlots: { customRender: 'system' }
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
    label: '所属租户',
    prop: 'tenantName'
  },
  {
    label: '所属项目',
    prop: 'projectName'
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
    Detail,
    addPolicy
  },
  data() {
    return {
      vmStatusColorFilter,
      openstackServerFilter,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: 'IP', value: 'privateIps' },
        {
          type: 'Select',
          label: '状态',
          value: 'status',
          data: [
            { id: 'RUNNING', name: '运行中' },
            { id: 'BUILDING', name: '创建中' },
            { id: 'STOPPED', name: '关机' },
            { id: 'SUSPENDED', name: '挂起' },
            { id: 'EXCEPTION', name: '异常' },
            { id: 'UNKNOWN', name: '断开' }
          ]
        },
        { type: 'Const', value: 'vendorType', initValue: 'APSARASTACK' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId },
        { type: 'Const', value: 'isTemplate', initValue: false }
      ],
      columns,
      params: {
        page: 1,
        rows: 10
      },
      list: [],
      total: 0,
      loading: false,
      customColorMethod,
      visible: false,
      detailData: {},
      vmData,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_APSARASTACK_VM',
      activeTab: '1'
    }
  },
  created() {
    this.getQuotas()
  },
  methods: {
    getList() {
      getVms(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            item.cpuUsage = Number(item.cpuUsage)
            item.memUsage = Number(item.memUsage)
            if (item.privateIps) {
              item.privateIps = JSON.parse(item.privateIps)
            }
          })
        }
      })
    },
    getDetail(data) {
      this.detailData = data
      this.visible = true
    },
    goBack() {
      this.visible = false
    },
    async getQuotas() {
      const { data } = await getMonitorList({ page: 1, rows: 9999, params: '[{"param":{"resourceType":"MONITOR_APSARASTACK_VM"},"sign":"EQ"}]' })
      Object.keys(vmData).forEach((key) => {
        vmData[key].forEach((item) => {
          if (data.rows.find((row) => row.expr == item.value)) {
            const { name, unit } = data.rows.find((row) => row.expr == item.value)
            item.name = `['${name}']`
            item.unit = unit
            item.title = name
          }
        })
      })
    },
    handleMonitorDetail(id, name) {
      this.$router.push({
        name: 'MonitorDetailList',
        query: { id: id, name: name, type: this.resourceType }
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
      handleStart(this, data, this.resourceType)
    }
  }
}
</script>
