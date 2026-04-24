<template>
  <div class="wrapper">
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="containerMonitorTable">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="healthStatusFilter(status, 'color')">
          {{ healthStatusFilter(status, 'status') }}
        </status-icon>
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
    <common-detail v-if="detailFlag" :setting="{ logoText: '设备' }" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <overview ref="overview" :detail-uuid="detailUuid"></overview>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { healthStatusFilter } from '@/filters/huawei'
import { getRuleGroupBind } from 'services/monitor/index.js'
import { getStorages } from 'services/monitor/storage'
import overview from './equipment_detail.vue'
import { handleStart } from 'views/data'
import addPolicy from 'views/components/linkPolicy.vue'
const searchConfigs = [
  { type: 'Input', label: '名称', value: 'name' },
  { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId }
]
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
    prop: 'ip'
  },
  {
    label: '设备状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '总容量（GB）',
    prop: 'diskCapacity'
  },
  {
    label: '磁盘总数',
    prop: 'diskAllCount'
  },
  {
    label: '已用磁盘数',
    prop: 'diskUseCount'
  },
  {
    label: '序列号',
    prop: 'sn'
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
  props: {
    projectName: {
      type: String
    }
  },
  components: {
    overview,
    addPolicy
  },
  data() {
    return {
      handleStart,
      columns,
      searchConfigs,
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
      list: [],
      total: 0,
      idList: [],
      selectList: [],
      detailFlag: false,
      detailData: {},
      detailUuid: null,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: this.projectName == 'HUAWEI' ? 'MONITOR_STORAGE_HUAWEI_STORAGE' : 'MONITOR_STORAGE_DELL_STORAGE'
    }
  },
  methods: {
    getList() {
      this.loading = true
      this.refreshId()
      getStorages(this.params).then((data) => {
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
      this.detailUuid = row.storageUuid
      this.detailFlag = true
    },
    goBack() {
      this.detailFlag = false
    },
    handleMonitorDetail(id, name) {
      this.$router.push({
        name: 'monitorHuaweiStorageDetail',
        query: { id: id, name: name, type: this.resourceType }
      })
    }
  },
  created() {}
}
</script>
