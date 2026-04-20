<template>
  <div class="wrapper">
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #role="role">
        {{ rolePoolTypeFilter(role) }}
      </template>
      <template #status="val, record">
        <status-icon :type="xskyStatusFilter(record.status, 'color')">
          {{ xskyStatusFilter(record.status, 'status') }}
        </status-icon>
      </template>
      <template #capacity="capacity">
        {{ capacity.toFixed(2) }}
      </template>
      <template #usedCapacity="val, record">
        {{ record.usedCapacity.toFixed(2) }}
      </template>
      <template #usePercent="val, record"> {{ ((record.usedCapacity / record.capacity) * 100).toFixed(2) }}% </template>
      <template #warning="val"> {{ val * 100 }} % </template>
      <template #dataStatus="dataStatus">
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content">
            <div>健康的：{{ dataStatus.healthyPercent * 100 }}%</div>
            <div>降级的：{{ dataStatus.degradedPercent * 100 }}%</div>
            <div>待恢复：{{ dataStatus.recoveryPercent * 100 }}%</div>
            <div>不可：{{ dataStatus.unavailablePercent * 100 }}%</div>
          </div>
          <el-progress :percentage="dataStatus.healthyPercent * 100" :show-text="false"></el-progress>
        </el-tooltip>
      </template>
      <template #deviceType="val">
        {{ deviceTypeFilter(val) }}
      </template>
      <template #stratage="val, record">
        {{ record.replicateCnt > 0 ? record.replicateCnt + '副本' : record.eCDataBolckCnt + ' + ' + record.eCCodeBolckCnt }}
      </template>
      <template #bytes="val, record">
        {{ (record.props.sample.totalBandwidthKbyte / 1024).toFixed(2) }}
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
        <detail :detail-data="detailData" :params-str="paramsStr"></detail>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { deviceTypeFilter, rolePoolTypeFilter, xskyStatusFilter } from '@/filters/xsky'
import { getRuleGroupBind } from 'services/monitor/index.js'
import { getPool } from 'services/monitor/xsky.js'
import detail from './poolDetail.vue'
import { handleStart } from 'views/data'
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
    label: '邮箱',
    prop: 'email'
  },
  {
    label: '角色',
    prop: 'role',
    scopedSlots: { customRender: 'role' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '总容量(GB)',
    prop: 'capacity',
    scopedSlots: { customRender: 'capacity' }
  },
  {
    label: '已用容量(GB)',
    prop: 'usedCapacity',
    scopedSlots: { customRender: 'usedCapacity' }
  },
  {
    label: '已用百分比',
    prop: 'usePercent',
    scopedSlots: { customRender: 'usePercent' }
  },
  {
    label: '数据状态',
    prop: 'dataStatus',
    scopedSlots: { customRender: 'dataStatus' }
  },
  {
    label: '存储介质',
    prop: 'deviceType',
    scopedSlots: { customRender: 'deviceType' }
  },
  {
    label: '数据安全策略类型',
    prop: 'stratage',
    scopedSlots: { customRender: 'stratage' }
  },
  {
    label: '硬盘容量阈值',
    prop: 'warning',
    scopedSlots: { customRender: 'warning' }
  },
  {
    label: '硬盘数',
    prop: 'osds.length'
  },
  {
    label: '总带宽(Mb/s)',
    prop: 'bytes',
    scopedSlots: { customRender: 'bytes' }
  },
  {
    label: '总IOP',
    prop: 'props.sample.totalIops'
  },
  {
    label: '块存储卷数',
    prop: 'volumes.length'
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
      deviceTypeFilter,
      rolePoolTypeFilter,
      xskyStatusFilter,
      handleStart,
      columns,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId }
      ],
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
      resourceType: 'MONITOR_XSKY_VOLUME_POOL'
    }
  },
  computed: {
    paramsStr() {
      const { vendorId, poolUuid } = this.detailData
      return `vendorId = "${vendorId}", id = "${poolUuid}"`
    }
  },
  methods: {
    getList() {
      this.loading = true
      this.refreshId()
      getPool(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            item.props = JSON.parse(item.props)
            item.dataStatus = JSON.parse(item.dataStatus)
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
