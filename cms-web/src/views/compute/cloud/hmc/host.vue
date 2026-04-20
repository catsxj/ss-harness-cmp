<template>
  <div class="wrapper">
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="containerMonitorTable">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="serverStatusColor(status)">
          {{ serverStatus(status) }}
        </status-icon>
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
        <overview ref="overview" :detail-uuid="detailUuid"></overview>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { getServers, getRuleGroupBind } from 'services/monitor/index.js'
import overview from './host_detail.vue'
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
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '可用的处理单元数',
    prop: 'processorUnits'
  },
  {
    label: '可用内存量（GB）',
    prop: 'systemMemoryGB'
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
    addPolicy
  },
  data() {
    return {
      columns,
      handleStart,
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
      detailUuid: null,
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_HMC_SERVER'
    }
  },
  methods: {
    serverStatusColor(value) {
      switch (value) {
        case 'operating':
        case 'recovery':
        case 'no connection':
        case 'CREATE_RUNNING':
        case 'POWERON_RUNNING':
          return 'normal'
        case 'power off':
        case 'service processor failover':
        case 'error':
        case 'error - dump in progress':
        case 'error - terminated':
        case 'version mismatch':
        case 'incomplete':
        case 'failed authentication':
        case 'POWEROFF_RUNNING':
        case 'REMOVE_CONNECTION_RUNNING':
        case 'RESET_CONNECTION_RUNNING':
        case '删除中':
          return 'danger'
        case 'initializing':
        case 'standby':
        case 'power off in progress':
        case 'pending authentication - password updates required':
        case 'UPDATE_RUNNING':
          return 'warning'
        default:
          return 'normal'
      }
    },
    serverStatus(status) {
      const statusMap = {
        operating: '运行',
        'power off': '断电',
        initializing: '正在初始化',
        standby: '待机',
        'service processor failover': '服务处理器故障',
        'power off in progress': '正在断电',
        error: '错误',
        'error - dump in progress': '错误-正在转储',
        'error - terminated': '错误-终止',
        'version mismatch': '版本不匹配',
        incomplete: '残缺',
        recovery: '恢复',
        'no connection': '未连接',
        'failed authentication': '身份验证失败',
        'pending authentication - password updates required': '等待验证-需要更新密码',
        CREATE_RUNNING: '创建中',
        POWERON_RUNNING: '开机中',
        POWEROFF_RUNNING: '断电中',
        REMOVE_CONNECTION_RUNNING: '关闭连接中',
        RESET_CONNECTION_RUNNING: '重置连接中',
        UPDATE_RUNNING: '正在更新'
      }
      return statusMap[status] || status
    },
    getList() {
      this.loading = true
      this.refreshId()
      getServers(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
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
      this.detailData = {
        name: row.name
      }
      this.detailUuid = row.uuid
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
