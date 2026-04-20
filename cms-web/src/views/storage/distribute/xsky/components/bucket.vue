<template>
  <div class="wrapper">
    <div v-if="!detailFlag">
      <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #status="status">
          <status-icon :type="status | stautsIconFilter">
            {{ status | statusFilter }}
          </status-icon>
        </template>
        <template #capacity="val, record">
          <MyProgress :total="record.quotaMaxSize" :used="record.allocatedSize">
            <span slot="used">{{ record.allocatedSize | capacityFilter({ zeroTrans: false }) }}</span>
            <span slot="total">{{ record.quotaMaxSize | capacityFilter }}</span>
          </MyProgress>
        </template>
        <template #object="val, record">
          <MyProgress :total="record.quotaMaxSize" :used="record.allocatedSize">
            <span slot="used">{{ record.allocatedObjects }}</span>
            <span slot="total">{{ record.quotaMaxObjects | quotaFilter }}</span>
          </MyProgress>
        </template>
        <template #worm="val">
          <span>{{ val ? '开启' : '未开启' }}</span>
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
    </div>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <detail :detail-data="detailData" :params-str="paramsStr"></detail>
      </div>
    </common-detail>
  </div>
</template>

<script>
import MyProgress from './progress'
import { getRuleGroupBind } from 'services/monitor/index.js'
import { getBucket } from 'services/monitor/xsky.js'
import detail from './bucketDetail.vue'
import { statusFilter, stautsIconFilter, capacityFilter, quotaFilter } from '../filters'
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
    label: '容量配额',
    scopedSlots: { customRender: 'capacity' }
  },
  {
    label: '对象数配额',
    scopedSlots: { customRender: 'object' }
  },
  {
    label: '拥有者',
    prop: 'objectUserName'
  },
  {
    label: '写保护',
    prop: 'worm',
    scopedSlots: { customRender: 'worm' }
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
    MyProgress,
    addPolicy
  },
  filters: { statusFilter, stautsIconFilter, capacityFilter, quotaFilter },
  data() {
    return {
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId }
      ],
      handleStart,
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
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_XSKY_OBJECT_BUCKET'
    }
  },
  computed: {
    paramsStr() {
      const { vendorId, bucketUuid } = this.detailData
      return `vendorId = "${vendorId}", id = "${bucketUuid}"`
    }
  },
  methods: {
    getList() {
      this.refreshId()
      this.loading = true
      getBucket(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
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
