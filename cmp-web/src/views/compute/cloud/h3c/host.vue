<template>
  <div class="wrapper">
    <div v-if="!detailFlag">
      <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #status="status">
          <status-icon :type="vmStatusColorFilter(status)">
            {{ openstackServerFilter(status) }}
          </status-icon>
        </template>
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
              <el-dropdown-item @click="handleLink(record.id)"> 关联规则 </el-dropdown-item>
              <el-dropdown-item @click="handlePolicy(record)">
                {{ `${record.alarmEnable ? '屏蔽' : '开启'}告警` }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </AdvanceTable>
      <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
    </div>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <detail :detail-id="detailId" :identifier="detailData.name"></detail>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { vmStatusColorFilter, openstackServerFilter } from '@/filters/index'
import { getPolicyHosts, getRuleGroupBind } from 'services/monitor/index.js'
import detail from './host_detail.vue'
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
    label: '主机IP',
    prop: 'manageIp'
  },
  {
    label: '所属集群',
    prop: 'clusterName'
  },
  {
    label: '数据中心',
    prop: 'vdcName'
  },
  {
    label: '主机状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
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
    label: '总CPU（MHz）',
    prop: 'cpuTotal'
  },
  {
    label: '总内存（GB）',
    prop: 'memTotal'
  },
  {
    label: '云主机数',
    prop: 'vmNum'
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
    detail,
    addPolicy
  },
  data() {
    return {
      vmStatusColorFilter,
      openstackServerFilter,
      customColorMethod,
      handleStart,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: 'IP', value: 'manageIp' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId }
      ],
      columns,
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
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_H3C_HOST'
    }
  },
  computed: {
    paramsStr() {
      const { uuid, name, manageIp } = this.detailData
      return `id = "${uuid}", ip = "${manageIp}",name = "${name}"`
    }
  },
  methods: {
    getList() {
      this.loading = true
      this.refreshId()
      getPolicyHosts(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            item.cpuUsage = Number(item.cpuUsage)
            item.memUsage = Number(item.memUsage)
            setTimeout(() => {
              if (this.idList.indexOf(item.id) > -1) this.$refs.resourceMonitorTable.toggleRowSelection(item, true)
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
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
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
      this.detailData = row
      this.detailId = row.uuid
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
