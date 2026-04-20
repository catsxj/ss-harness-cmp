<template>
  <div>
    <el-dialog title="关联规则" :visible.sync="addFlag" v-if="addFlag" width="70%" @close="$emit('cancle')">
      <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="thresholdTable">
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
      </AdvanceTable>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="$emit('cancle')">取 消</el-button>
        <el-button type="primary" :loading="loading" @click.native="addSubmit">确 定</el-button>
      </span>
      <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
        <div style="background: #fff; padding: 0 0 0 10px" slot="custom_content">
          <el-tabs value="list">
            <el-tab-pane name="list" label="告警规则">
              <common-detail-item :col="8" label="名称">{{ detailData.name }}</common-detail-item>
              <common-detail-item :col="8" label="资源类别">{{ detailData.catalog | resourceCatalogMonitor }}</common-detail-item>
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
              <vm-table ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType.indexOf('VM') > -1" status="detail" :resourceIds="detailData.resourceIds"></vm-table>
              <data-store-table ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_VCENTER_DATASTORE'" status="detail" :resourceIds="detailData.resourceIds"></data-store-table>
              <host-table ref="resourceList" :resourceType="detailData.resourceType" v-if="type == 'HOST'" status="detail" :resourceIds="detailData.resourceIds"></host-table>
              <database
                ref="resourceList"
                :resourceType="detailData.resourceType"
                v-if="detailData.resourceType.indexOf('MONITOR_RDS') > -1 || detailData.resourceType.indexOf('MONITOR_KVS') > -1 || detailData.resourceType.indexOf('MONITOR_CMS') > -1 || detailData.resourceType.indexOf('MONITOR_CCS') > -1"
                status="detail"
                :resourceIds="detailData.resourceIds"
              ></database>
            </el-tab-pane>
            <el-tab-pane label="分发策略" name="policy">
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
    </el-dialog>
  </div>
</template>

<script>
import { getRuleGroup, getDistriDetail, rulegroupsBinding, rulegroupsUnBinding } from 'services/monitor/index.js'
import levelIcon from 'views/monitor/components/statusIcon.vue'
import vmTable from 'views/monitor/alarm_manage/monitorPolicy/vm'
import hostTable from 'views/monitor/alarm_manage/monitorPolicy/host'
import dataStoreTable from 'views/monitor/alarm_manage/monitorPolicy/vcenter_dataStore'
import database from 'views/monitor/alarm_manage/monitorPolicy/database'
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
  props: {
    catalog: {
      type: String
    },
    resourceType: {
      type: String
    },
    addLinkFlag: {
      type: Boolean
    },
    resourceId: {
      type: Number
    },
    ruleGroupIds: {
      type: Array
    }
  },
  components: {
    levelIcon,
    vmTable,
    hostTable,
    dataStoreTable,
    database
  },
  data() {
    return {
      columns,
      columns2,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        // { type: 'Const', value: 'catalog', initValue: this.catalog },
        { type: 'Const', value: 'resourceType', initValue: this.resourceType },
        { type: 'Const', value: 'isGlobal', initValue: false }
      ],
      loading: false,
      funList,
      timeList,
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      idList: [],
      selectList: [],
      detailFlag: false,
      detailData: {},
      policyData: {},
      type: '',
      addFlag: false,
      flag: 0
    }
  },
  beforeCreate() {},
  created() {
    console.log(this.resourceType)
    if (this.addLinkFlag) {
      this.addFlag = true
    }
  },
  methods: {
    getList() {
      this.loading = true
      if (this.ruleGroupIds.length && !this.flag) {
        this.ruleGroupIds.forEach(item => {
          this.selectList.push({ id: item })
        })
        this.flag++
      }
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
    // 查询
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
    addSubmit() {
      this.refreshId()
      this.loading = true
      rulegroupsBinding({
        resourceId: this.resourceId,
        ruleGroupIds: this.idList,
        resourceType: this.resourceType
      }).then(data => {
        if (data.success) {
          this.$message.success({
            message: data.message,
            type: 'success'
          })
          this.selectList = []
          this.$emit('cancle')
        }
      })
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
      getDistriDetail(this.detailData.policyId).then(data => {
        if (data.success) {
          this.policyData = Object.assign({}, data.data)
        }
      })
      this.detailFlag = true
    },
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
