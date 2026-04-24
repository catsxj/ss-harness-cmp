<template>
  <div>
    <common-detail v-if="detailFlag" :setting="{ type: 'Zookeeper' }" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="版本">{{ detail.version }}</common-detail-item>
        <common-detail-item label="当前状态">
          <status-icon :type="vmStatusColorFilter(detail.status)">{{ databaseFilter(detail.status) }} </status-icon>
        </common-detail-item>
        <common-detail-item label="部署方式">{{ detail.category }}</common-detail-item>
        <common-detail-item label="配置">{{ detail.spec ? detail.spec : '--' }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
        <common-detail-item label="过期时间">{{ detail.expiredTime ? detail.expiredTime : '无限期' }}</common-detail-item>
        <common-detail-item label="服务地址">{{ detail.address }}</common-detail-item>
      </template>
      <detail :detail-id="detailId" :detail="detail"></detail>
    </common-detail>
    <AdvanceTable ref="databaseTable" title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll">
      <template #name="val, record">
        <span v-if="record.status === 'BUILDING'">{{ val }}</span>
        <span v-else class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="vmStatusColorFilter(status)">{{ databaseFilter(status) }} </status-icon>
      </template>
      <template #spec="spec">
        <span>{{ spec ? spec : '--' }}</span>
      </template>
      <template #expiredTime="expiredTime">
        <span>{{ expiredTime ? expiredTime : '无期限' }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="alarmDetail(record)">告警详情</el-button>
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
</template>

<script>
import { vmStatusColorFilter, databaseFilter } from '@/filters/index'
import webSocket from '@/common/mixins/getGlobalSocket'
import detail from './zookeeperDetail'
import { getRuleGroupBind } from 'services/monitor'
import { getCcs, getCcsDetail } from 'services/monitor/middleware'
import { columns } from './data'
import { handleStart } from 'views/data'
import addPolicy from 'views/components/linkPolicy.vue'
const searchConfigs = [
  { type: 'Input', label: '名称', value: 'name' },
  { type: 'Const', value: 'type', initValue: 'zookeeper' },
  { type: 'Const', value: 'status', initValue: 'BUILDING', sign: 'UEQ' }
]
export default {
  components: { detail, addPolicy },
  mixins: [webSocket],
  data() {
    return {
      vmStatusColorFilter,
      databaseFilter,
      handleStart,
      columns,
      searchConfigs,
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10,
        catalog: 'MONITOR_CCS_ZOOKEEPER'
      },
      idList: [],
      selectList: [],
      detailFlag: false,
      detail: {},
      detailId: 0,
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_CCS_ZOOKEEPER'
    }
  },
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  created() {},
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('zookeeper') > -1) {
        this.getList()
      }
    },
    goBack() {
      this.detailFlag = false
    },
    // 详情
    getDetail(id) {
      this.detailId = id
      getCcsDetail(id).then((data) => {
        if (data.success) {
          this.detail = data.data
          this.detail.expiredTime = this.detail.expiredTime ? (this.detail.expiredTime.indexOf('2099') > -1 ? '无限期' : this.detail.expiredTime) : this.detail.expiredTime
          this.detailFlag = true
        }
      })
    },
    getList() {
      this.loading = true
      this.refreshId()
      getCcs(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.databaseTable.toggleRowSelection(item, true)
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
        this.list.forEach((item) => {
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
    alarmDetail(row) {
      this.$router.push({
        name: 'monitorDatabaseDetail',
        query: { id: row.id, name: row.name, type: this.resourceType }
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
    }
  }
}
</script>
<style scoped>
.detail_icon {
  font-size: 25px;
  margin: 10px;
  color: #409eff;
}
</style>
