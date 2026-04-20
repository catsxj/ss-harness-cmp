<template>
  <el-card>
    <div v-if="!detailFlag">
      <el-form class="m-t" :inline="true">
        <el-form-item>
          <el-input placeholder="名称" v-model="listQuery.name"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-select placeholder="资源类型" clearable v-model="listQuery.resourceType">
            <el-option v-for="(item, index) in resourceList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button type="ghost" icon="el-icon-refresh" @click="handleReSet">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
          <el-button type="ghost" icon="el-icon-delete" @click="handleBatchDelete">删除</el-button>
        </el-form-item>
      </el-form>
      <AdvanceTable title="告警规则列表" :search-configs="[]" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="thresholdTable" :show-tools="false">
        <!-- <template v-slot:action>
        <el-button type="primary" @click="handleCreate()">
          <i class="el-icon-plus"></i>
          新增
        </el-button>
        <el-button type="ghost" @click="handleBatchDelete" :disabled="!selectList.length">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
      </template> -->
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #resourceType="resourceType">
          {{ resourceType | resourceTypeMonitor }}
        </template>
        <template #isGlobal="isGlobal">
          {{ isGlobal ? '全局' : '自定义' }}
        </template>
        <template #enable="val">
          <status-icon :type="val ? 'success' : 'danger'">{{ val ? '已开启' : '已禁用' }} </status-icon>
        </template>
        <template #operate="val, record">
          <el-button type="text" @click="handleCreate(record)">编辑</el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="handleForbid(record)">{{ record.enable ? '禁用' : '启用' }}</el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="handleDelete(record.id)">删除</el-button>
        </template>
      </AdvanceTable>
    </div>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div style="background: #fff; padding: 0 0 0 10px" slot="custom_content">
        <el-tabs value="list">
          <el-tab-pane name="list" label="告警规则">
            <common-detail-item :col="8" label="名称">{{ detailData.name }}</common-detail-item>
            <common-detail-item :col="8" label="资源类型">{{ detailData.resourceType | resourceTypeMonitor }}</common-detail-item>
            <common-detail-item label="描述">{{ detailData.remark }}</common-detail-item>
            <div style="clear: both"></div>
            <div v-for="(item, index) in detailData.rulesFormat" :key="index" class="m-b">
              <div class="table-title">{{ item.name }}</div>
              <AdvanceTable :search-configs="[]" :data="item.data" :columns="columns2" :showTools="false">
                <template #rule="val, record">
                  <span v-if="record.intervalTime">在过去{{ record.intervalTime.substring(0, record.intervalTime.length - 1) }}{{ timeList[record.intervalTime.substring(record.intervalTime.length - 1)] }}内，</span>
                  {{ funList[record.fun] }} {{ record.operator }}{{ record.threshold }}{{ record.unit }}
                  <span v-if="record.for1"> 持续{{ record.for1.substring(0, record.for1.length - 1) }}{{ timeList[record.for1.substring(record.for1.length - 1)] }}</span>
                </template>
                <template #level="level">
                  <level-icon :color="level | alarmLevelColor">
                    {{ level | alarmLevel }}
                  </level-icon>
                </template>
                <div slot="pagination"></div>
              </AdvanceTable>
            </div>
          </el-tab-pane>
          <el-tab-pane label="告警范围" name="range">
            <vm ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType.indexOf('VM') > -1" status="detail" :resourceIds="detailData.resourceIds"></vm>
            <data-store ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_VCENTER_DATASTORE'" status="detail" :resourceIds="detailData.resourceIds"></data-store>
            <host ref="resourceList" :resourceType="detailData.resourceType" v-if="type == 'HOST'" status="detail" :resourceIds="detailData.resourceIds"></host>
            <dell-device ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_STORAGE_DELL_STORAGE'" status="detail" :resourceIds="detailData.resourceIds"></dell-device>
            <dell-disk ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_STORAGE_DELL_DISK'" status="detail" :resourceIds="detailData.resourceIds"></dell-disk>
            <dell-volume ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_STORAGE_DELL_VOLUME'" status="detail" :resourceIds="detailData.resourceIds"></dell-volume>
            <k8s-node ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_KUBERNETES_NODE'" status="detail" :resourceIds="detailData.resourceIds"></k8s-node>
            <k8s-pod ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_KUBERNETES_POD'" status="detail" :resourceIds="detailData.resourceIds"></k8s-pod>
            <hmc-server ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_HMC_SERVER'" status="detail" :resourceIds="detailData.resourceIds"></hmc-server>
            <hmc-lpar ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_HMC_VIOS'" status="detail" :resourceIds="detailData.resourceIds" partitionType="Virtual IO Server"></hmc-lpar>
            <hmc-lpar ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_HMC_AIX'" status="detail" :resourceIds="detailData.resourceIds" partitionType="AIX/Linux"></hmc-lpar>
            <database
              ref="resourceList"
              :resourceType="detailData.resourceType"
              v-if="detailData.resourceType.indexOf('MONITOR_RDS') > -1 || detailData.resourceType.indexOf('MONITOR_KVS') > -1 || detailData.resourceType.indexOf('MONITOR_CMS') > -1 || detailData.resourceType.indexOf('MONITOR_CCS') > -1"
              status="detail"
              :resourceIds="detailData.resourceIds"
            ></database>
            <cisco ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_CISCO_SANFABRIC'" status="detail" :resourceIds="detailData.resourceIds"></cisco>
            <op-service ref="resourceList" v-if="detailData.resourceType == 'MONITOR_OPENSTACK_SERVICE'" status="detail" :list="openStackServiceModels"></op-service>
          </el-tab-pane>
          <el-tab-pane v-if="detailData.policyId" label="分发策略" name="policy">
            <common-detail-item :col="8" label="名称">{{ policyData.name }}</common-detail-item>
            <common-detail-item :col="8" label="延迟时间">{{ policyData.waitTime | waiteTime }}</common-detail-item>
            <common-detail-item :col="8" label="接收提示告警">{{ policyData.remind | isTrue }}</common-detail-item>
            <common-detail-item :col="8" label="接收次要告警">{{ policyData.secondary | isTrue }}</common-detail-item>
            <common-detail-item :col="8" label="接收重要告警">{{ policyData.primary | isTrue }}</common-detail-item>
            <common-detail-item :col="8" label="接收紧急告警">{{ policyData.urgent | isTrue }}</common-detail-item>
            <common-detail-item :col="8" label="邮件">{{ policyData.email | isTrue }}</common-detail-item>
            <common-detail-item :col="8" label="站内信">{{ policyData.message | isTrue }}</common-detail-item>
            <common-detail-item :col="8" label="屏蔽策略开启">{{ policyData.action | isTrue }}</common-detail-item>
            <div style="clear: both"></div>
            <el-tabs value="user">
              <el-tab-pane name="user">
                <span slot="label"><i class="el-icon-date"></i> 分发人列表</span>
                <basic-table :data="policyData.receiverInfos">
                  <el-table-column prop="account" label="登录账号"> </el-table-column>
                  <el-table-column prop="name" label="用户姓名"> </el-table-column>
                  <el-table-column prop="email" label="邮箱"> </el-table-column>
                  <el-table-column label="状态">
                    <template slot-scope="scope">
                      {{ scope.row.status | status('status') }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="mobile" label="移动电话"> </el-table-column>
                  <div slot="pagination"></div>
                </basic-table>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </div>
    </common-detail>
  </el-card>
</template>

<script>
import { getRuleGroup, removeRuleGroup, batchRemoveRuleGroup, getDistriDetail, ruleGroupEnable } from 'services/monitor/index.js'
import levelIcon from 'views/monitor/components/statusIcon.vue'
import { getResourceList } from 'services/platform/index'
import vm from './vm.vue'
import host from './host.vue'
import dataStore from './vcenter_dataStore.vue'
import dellDevice from './storage_hw_dell_device.vue'
import dellDisk from './storage_hw_dell_disk.vue'
import dellVolume from './storage_hw_dell_volume.vue'
import k8sNode from './k8s_node.vue'
import k8sPod from './k8s_container.vue'
import hmcServer from './hmc_host.vue'
import hmcLpar from './hmc_lpar.vue'
import database from './database.vue'
import cisco from './cisco.vue'
import opService from './op_service_detail.vue'
const funList = {
  max: '最大值',
  min: '最小值',
  average: '平均值'
}
const timeList = {
  m: '分钟',
  h: '小时',
  s: '秒'
}
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
    label: '资源类型',
    prop: 'resourceType',
    scopedSlots: { customRender: 'resourceType' }
  },
  {
    label: '状态',
    prop: 'enable',
    scopedSlots: { customRender: 'enable' }
  },
  {
    label: '创建人',
    prop: 'createName'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '描述',
    prop: 'remark'
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '160px',
    scopedSlots: { customRender: 'operate' }
  }
]
const columns2 = [
  {
    label: '规则',
    prop: 'rule',
    scopedSlots: { customRender: 'rule' }
  },
  {
    label: '告警级别',
    prop: 'level',
    scopedSlots: { customRender: 'level' }
  }
]
export default {
  components: {
    levelIcon,
    vm,
    host,
    dataStore,
    dellDevice,
    dellVolume,
    dellDisk,
    k8sNode,
    k8sPod,
    hmcServer,
    hmcLpar,
    database,
    cisco,
    opService
  },
  data() {
    return {
      columns,
      columns2,
      loading: false,
      resourceList: [],
      funList,
      timeList,
      list: null,
      total: null,
      listQuery: {
        name: '',
        catalog: '',
        resourceType: '',
        valueType: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      idList: [],
      selectList: [],
      detailFlag: false,
      detailData: {},
      policyData: {},
      type: ''
    }
  },
  created() {
    this.handleSearch()
    this.getResources()
  },
  methods: {
    getResources() {
      getResourceList().then(({ data, success }) => {
        if (success) {
          this.resourceList = data.rows.map(item => ({ ...item, value: item.resourceType }))
        }
      })
    },
    getList() {
      this.loading = true
      this.refreshId()
      getRuleGroup(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach(item => {
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.thresholdTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    handleReSet() {
      this.listQuery = {}
      this.handleSearch()
    },
    // 查询
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        catalog: this.listQuery.catalog || '',
        valueType: this.listQuery.valueType || '',
        'name:LK': this.listQuery.name,
        'resourceType:LK': this.listQuery.resourceType || ''
      })
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
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach(item => {
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
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    handleCreate(data) {
      if (data) {
        this.$router.push({ name: 'ModifyMonitorPolicy', query: { id: data.id } })
      } else {
        this.$router.push({ name: 'CreateMonitorPolicy', query: { id: 0 } })
      }
    },
    handleDelete(id) {
      this.$confirm('您确定要删除该告警策略吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          removeRuleGroup(id).then(data => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    handleBatchDelete() {
      this.refreshId()
      this.$confirm('您确定要批量删除选择告警策略吗?', '提示', {
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          batchRemoveRuleGroup({
            ids: this.idList
          }).then(data => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.selectList = []
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    handleForbid(row) {
      this.$confirm(`您确定要${row.enable ? '禁用' : '启用'}该告警策略吗?`, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          ruleGroupEnable({
            id: row.id,
            enable: !row.enable
          }).then(data => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    getDetail(row) {
      this.detailData = Object.assign({}, row)
      if (this.detailData.resourceType == 'MONITOR_VCENTER_HOST' || this.detailData.resourceType == 'MONITOR_OPENSTACK_HOST' || this.detailData.resourceType == 'MONITOR_FUSIONCLOUD_HOST' || this.detailData.resourceType == 'MONITOR_H3C_HOST') {
        this.type = 'HOST'
      }
      const arr = []
      this.detailData.rules.forEach(rule => {
        const parent = arr.find(cur => cur.name == rule.name && cur.tag == rule.tag)
        if (parent) {
          parent.data.push(rule)
        } else {
          const obj = {
            name: rule.name,
            tag: rule.tag,
            data: [rule]
          }
          arr.push(obj)
        }
      })
      this.detailData.rulesFormat = arr
      if (this.detailData.policyId) {
        getDistriDetail(this.detailData.policyId).then(data => {
          if (data.success) {
            this.policyData = Object.assign({}, data.data)
          }
        })
      }
      this.detailFlag = true
    },
    handleSearchRange() {},
    goBack() {
      this.detailFlag = false
    }
  }
}
</script>
<style scoped>
.search-item {
  width: 12%;
}
.rule-box {
  padding: 10px;
  padding-top: 0px;
  border: 1px solid #dcdfe6;
}
.table-title {
  background: #ececec;
  padding: 10px 0px 10px 10px;
}
</style>
