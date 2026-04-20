<template>
  <div>
    <AdvanceTable :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #status="status">
        <status-icon :type="statusFilter[status]">
          {{ filter[status] }}
        </status-icon>
      </template>
      <template #aaopStatus="aaopStatus">
        <status-icon :type="aaopStatusFilter(aaopStatus, 'color')">
          {{ aaopStatusFilter(aaopStatus, 'status') }}
        </status-icon>
      </template>
      <template #type="type">
        {{ filter[type] }}
      </template>
      <template #instanceNetworkType="instanceNetworkType">
        {{ filter[instanceNetworkType] }}
      </template>
      <template #payType="payType">
        {{ filter[payType] }}
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ (record.instanceId || '--') + ' / ' + val }}</span>
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
    <common-detail v-if="visible" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <el-card v-if="visible">
          <Detail :detail-id="detailData.id" :instance-id="detailData.instanceId" :typeData="rdsData['RDS监控']" />
        </el-card>
      </div>
    </common-detail>
    <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
  </div>
</template>
<script>
import { getMysqlRds, getRuleGroupBind } from 'services/monitor/index.js'
import { customColorMethod, handleStart } from 'views/data'
import { getMonitorList } from '@/services/monitor/configs'
import Detail from './detail.vue'
import addPolicy from 'views/components/linkPolicy.vue'
import { rdsData } from './data'
const columns = [
  {
    label: '实例ID/名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: 'AAOP状态',
    prop: 'aaopStatus',
    scopedSlots: { customRender: 'aaopStatus' }
  },
  {
    label: '版本',
    prop: 'dataStoreVersion'
  },
  {
    label: '规格',
    prop: 'cpu',
    customRender(cpu, { memory }) {
      return cpu && memory ? `${cpu}C/${memory}GB` : '--'
    }
  },
  {
    label: '存储空间（GB）',
    prop: 'volSize'
  },
  {
    label: '创建时间',
    prop: 'createDate'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
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
      filter: {
        Primary: '主实例',
        Readonly: '只读实例',
        Guard: '灾备实例',
        Temp: '临时实例',
        VPC: 'VPC',
        Classic: '经典网络',
        Postpaid: '按量付费',
        Prepaid: '包年包月',
        Creating: '创建中',
        Running: '使用中',
        Deleting: '删除中',
        Rebooting: '重启中',
        RebootFailed: '重启失败',
        DBInstanceClassChanging: '升降级中'
      },
      statusFilter: {
        Creating: 'warning',
        Running: 'success',
        Deleting: 'warning',
        Rebooting: 'warning',
        RebootFailed: 'danger',
        DBInstanceClassChanging: 'warning'
      },
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId }
      ],
      columns,
      params: {
        page: 1,
        rows: 10
      },
      list: [],
      total: 0,
      visible: false,
      rdsData,
      detailData: {},
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_APSARASTACK_RDS_MySQL'
    }
  },
  created() {
    this.getQuotas()
  },
  methods: {
    aaopStatusFilter(status, type) {
      const textMap = {
        SYNC_WAITING: '待同步',
        SYNCING: '同步中',
        SYNC_SUCCESS: '同步成功',
        SYNC_FAILED: '同步失败'
      }
      const colorMap = {
        SYNC_WAITING: 'primary',
        SYNCING: 'primary',
        SYNC_SUCCESS: 'success',
        SYNC_FAILED: 'danger'
      }
      return type === 'color' ? colorMap[status] || 'warning' : textMap[status] || '未知'
    },
    async getList() {
      const { success, data } = await getMysqlRds(this.params)
      if (success) {
        this.list = data.rows
        this.total = data.total
      }
    },
    async getQuotas() {
      const { data } = await getMonitorList({ page: 1, rows: 9999, params: '[{"param":{"resourceType":"MONITOR_APSARASTACK_RDS_MySQL"},"sign":"EQ"}]' })
      Object.keys(rdsData).forEach((key) => {
        rdsData[key].forEach((item) => {
          if (data.rows.find((row) => row.expr == item.value)) {
            const { name, unit } = data.rows.find((row) => row.expr == item.value)
            item.name = `['${name}']`
            item.unit = unit
            item.title = name
          }
        })
      })
    },
    getDetail(data) {
      this.detailData = data
      this.visible = true
    },
    goBack() {
      this.visible = false
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
