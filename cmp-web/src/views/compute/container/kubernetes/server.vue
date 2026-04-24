<template>
  <div class="wrapper">
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="containerMonitorTable">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="getDetail(record.name)"> 告警详情</el-button>
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
    <common-detail v-if="detailFlag" :setting="{ type: 'host' }" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <overview ref="overview" v-if="detailFlag" :detail-name="detailName" :detail-data="detailData"></overview>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { getRuleGroupBind } from 'services/monitor/index.js'
import { getService } from 'services/platform/k8s'
import overview from './container_detail.vue'
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
    label: '策略',
    prop: 'strategy'
  },
  {
    label: '命名空间',
    prop: 'namespace',
    scopedSlots: { customRender: 'status' }
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
    addPolicy
  },
  data() {
    return {
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
      loading: false,
      vendorData: [],
      searchData: {},
      list: [],
      total: 0,
      idList: [],
      selectList: [],
      detailFlag: false,
      detailData: {},
      detailName: null,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_KUBERNETES_SERVICE'
    }
  },
  methods: {
    getList() {
      this.loading = true
      this.refreshId()
      getService(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            if (item.projectVisibility && item.projectVisibility != 'GLOBAL_PROJECT') {
              item.disabled = true
              const self = this
              setTimeout(() => {
                if (self.idList.indexOf(item.id) > -1) self.$refs.containerMonitorTable.toggleRowSelection(item, true)
              })
            }
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
    getDetail(name) {
      this.detailData = {}
      this.detailName = name
      this.detailFlag = true
    },
    goBack() {
      this.detailFlag = false
    }
  },
  created() {}
}
</script>
