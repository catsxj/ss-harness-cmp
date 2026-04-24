<template>
  <div class="wrapper">
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="xskyStatusFilter(status, 'color')">
          {{ xskyStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #catalog="catalog">
        {{ xskyHostTypeFilter(catalog) }}
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
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <detail :detail-data="detailData" :params-str="paramsStr"></detail>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { xskyHostTypeFilter, xskyStatusFilter } from '@/filters/xsky'
import { getRuleGroupBind } from 'services/monitor/index.js'
import { getHost } from 'services/monitor/xsky.js'
import detail from './hostDetail.vue'
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
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: 'IP地址',
    prop: 'manageIp'
  },
  {
    label: '类型',
    prop: 'catalog',
    scopedSlots: { customRender: 'catalog' }
  },
  {
    label: '厂商',
    prop: 'provider'
  },
  {
    label: '型号',
    prop: 'version'
  },
  {
    label: '角色',
    prop: 'roleFormat'
  },
  {
    label: 'CPU利用率',
    prop: 'cpuUsage',
    scopedSlots: { customRender: 'cpuUsage' }
  },
  {
    label: '内存总量（GB）',
    prop: 'config.memoryCapacity'
  },
  {
    label: '内存利用率',
    prop: 'memUsage',
    scopedSlots: { customRender: 'memUsage' }
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
      xskyHostTypeFilter,
      xskyStatusFilter,
      handleStart,
      columns,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: 'IP', value: 'manageIp' },
        // { type: 'Const', value: 'catalog', initValue: 'MONITOR_XSKY_HOST' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId }
      ],
      customColorMethod,
      params: {
        page: 1,
        rows: 10,
        type: 'Host'
      },
      vendorData: [],
      list: [],
      total: 0,
      idList: [],
      selectList: [],
      detailFlag: false,
      detailData: {},
      detailId: null,
      managerIp: null,
      loading: false,
      map: {
        admin: '管理角色',
        monitor: '监控角色',
        block_storage_gateway: '块存储网关角色',
        s3_gateway: '对象存储网关角色',
        nfs_gateway: '对象存储网关角色',
        file_storage_gateway: '文件存储网关角色'
      },
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_XSKY_HOST'
    }
  },
  computed: {
    paramsStr() {
      const { vendorId, uuid } = this.detailData
      return `vendorId = "${vendorId}", id = "${uuid}"`
    }
  },
  methods: {
    getList() {
      this.refreshId()
      getHost(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            const provider = item.category ? item.category.substr(0, item.category.indexOf(' ')) : ''
            const version = item.category ? item.category.substr(item.category.indexOf(' ') + 1) : ''
            this.$set(item, 'provider', provider)
            this.$set(item, 'version', version)
            item.props = JSON.parse(item.props)
            this.$set(item, 'roleFormat', '')
            item.roles.forEach((role, index) => {
              item.roleFormat += this.map[role]
              if (index < item.roles.length - 1) {
                item.roleFormat += ', '
              }
            })
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
      this.detailFlag = true
    },
    goBack() {
      this.detailFlag = false
    },
    handleMonitorDetail(id, name, managerIp) {
      this.$router.push({
        name: 'XskyMonitorDetail',
        query: { id: id, name: name, type: this.resourceType }
      })
    }
  },
  created() {}
}
</script>
