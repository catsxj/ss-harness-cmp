<template>
  <div>
    <el-dialog title="关联规则" :visible.sync="addFlag" v-if="addFlag" width="70%" @close="$emit('cancle')">
      <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="thresholdTable">
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #resourceType="resourceType">
          {{ resourceTypeMonitorFilter(resourceType) }}
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
              <common-detail-item :col="8" label="资源类型">{{ resourceTypeMonitorFilter(detailData.resourceType) }}</common-detail-item>
              <common-detail-item label="描述">{{ detailData.remark }}</common-detail-item>
              <div style="clear: both"></div>
              <div v-for="(item, index) in detailData.rulesFormat" :key="index" class="m-b">
                <div class="table-title">{{ item.name }}</div>
                <AdvanceTable :data="item.data" :columns="columns2" :showTools="false">
                  <template #rule="val, record">
                    <span v-if="record.intervalTime">在过去{{ record.intervalTime.substring(0, record.intervalTime.length - 1) }}{{ timeList[record.intervalTime.substring(record.intervalTime.length - 1)] }}内，</span>
                    {{ funList[record.fun] }} {{ record.operator }}{{ record.threshold }}{{ record.unit }}
                    <span v-if="record.for1"> 持续{{ record.for1.substring(0, record.for1.length - 1) }}{{ timeList[record.for1.substring(record.for1.length - 1)] }}</span>
                  </template>
                  <template #level="level">
                    <level-icon :color="alarmLevelColorFilter(level)">
                      {{ alarmLevelFilter(level) }}
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
              <op-service-table ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_OPENSTACK_SERVICE'" status="detail" :resourceIds="detailData.resourceIds"></op-service-table>
              <easy-service-table ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_EASYSTACK_SERVICE'" status="detail" :resourceIds="detailData.resourceIds"></easy-service-table>
              <dell-device ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_STORAGE_DELL_STORAGE' || detailData.resourceType == 'MONITOR_STORAGE_HUAWEI_STORAGE'" status="detail" :resourceIds="detailData.resourceIds"></dell-device>
              <dell-disk ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_STORAGE_DELL_DISK' || detailData.resourceType == 'MONITOR_STORAGE_HUAWEI_DISK'" status="detail" :resourceIds="detailData.resourceIds"></dell-disk>
              <dell-volume ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_STORAGE_DELL_VOLUME' || detailData.resourceType == 'MONITOR_STORAGE_HUAWEI_VOLUME'" status="detail" :resourceIds="detailData.resourceIds"></dell-volume>
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
              <xsky-user ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_XSKY_OBJECT_USER'" status="detail" :resourceIds="detailData.resourceIds"></xsky-user>
              <xsky-router ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_XSKY_OBJECT_ROUTER'" status="detail" :resourceIds="detailData.resourceIds"></xsky-router>
              <xsky-bucket ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_XSKY_OBJECT_BUCKET'" status="detail" :resourceIds="detailData.resourceIds"></xsky-bucket>
              <xsky-volume ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_XSKY_VOLUME'" status="detail" :resourceIds="detailData.resourceIds"></xsky-volume>
              <xsky-pool ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_XSKY_VOLUME_POOL'" status="detail" :resourceIds="detailData.resourceIds"></xsky-pool>
              <xsky-osd ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_XSKY_CEPH_OSD'" status="detail" :resourceIds="detailData.resourceIds"></xsky-osd>
              <xsky-chache ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_XSKY_DISK'" status="detail" :resourceIds="detailData.resourceIds"></xsky-chache>
              <xsky-file-sys ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_XSKY_FILESYSTEM'" status="detail" :resourceIds="detailData.resourceIds"></xsky-file-sys>
              <cisco ref="resourceList" :resourceType="detailData.resourceType" v-if="detailData.resourceType == 'MONITOR_CISCO_SANFABRIC'" status="detail" :resourceIds="detailData.resourceIds"></cisco>
            </el-tab-pane>
            <el-tab-pane label="分发策略" name="policy" v-if="detailData.policyId">
              <common-detail-item :col="8" label="名称">{{ policyData.name }}</common-detail-item>
              <common-detail-item :col="8" label="延迟时间">{{ waiteTimeFilter(policyData.waitTime) }}</common-detail-item>
              <common-detail-item :col="8" label="接收提示告警">{{ booleanFilter(policyData.remind) }}</common-detail-item>
              <common-detail-item :col="8" label="接收次要告警">{{ booleanFilter(policyData.secondary) }}</common-detail-item>
              <common-detail-item :col="8" label="接收重要告警">{{ booleanFilter(policyData.primary) }}</common-detail-item>
              <common-detail-item :col="8" label="接收紧急告警">{{ booleanFilter(policyData.urgent) }}</common-detail-item>
              <common-detail-item :col="8" label="邮件">{{ booleanFilter(policyData.emai) }}</common-detail-item>
              <common-detail-item :col="8" label="站内信">{{ booleanFilter(policyData.message) }}</common-detail-item>
              <common-detail-item :col="8" label="屏蔽策略开启">{{ booleanFilter(policyData.action) }}</common-detail-item>
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
                        {{ statusFilter(scope.row.status) }}
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
import { getRuleGroup, getDistriDetail, rulegroupsBinding } from 'services/monitor/index.js'
import { booleanFilter, statusFilter, waiteTimeFilter, alarmLevelFilter, alarmLevelColorFilter, resourceTypeMonitorFilter } from '@/filters/index'
import levelIcon from 'views/components/statusIcon.vue'
import vmTable from 'views/alarm_manage/monitorPolicy/vm'
import hostTable from 'views/alarm_manage/monitorPolicy/host'
import opServiceTable from 'views/alarm_manage/monitorPolicy/op_service.vue'
import easyServiceTable from 'views/alarm_manage/monitorPolicy/easy_service.vue'
import dataStoreTable from 'views/alarm_manage/monitorPolicy/vcenter_dataStore'
import dellDevice from 'views/alarm_manage/monitorPolicy/storage_hw_dell_device'
import dellDisk from 'views/alarm_manage/monitorPolicy/storage_hw_dell_disk'
import dellVolume from 'views/alarm_manage/monitorPolicy/storage_hw_dell_volume'
import k8sNode from 'views/alarm_manage/monitorPolicy/k8s_node'
import k8sPod from 'views/alarm_manage/monitorPolicy/k8s_container'
import hmcServer from 'views/alarm_manage/monitorPolicy/hmc_host'
import hmcLpar from 'views/alarm_manage/monitorPolicy/hmc_lpar'
import database from 'views/alarm_manage/monitorPolicy/database'
import xskyFileSys from 'views/alarm_manage/monitorPolicy/xsky_fileSys.vue'
import xskyBucket from 'views/alarm_manage/monitorPolicy/xsky_bucket.vue'
import xskyChache from 'views/alarm_manage/monitorPolicy/xsky_chache.vue'
import xskyOsd from 'views/alarm_manage/monitorPolicy/xsky_disk.vue'
import xskyPool from 'views/alarm_manage/monitorPolicy/xsky_pool.vue'
import xskyRouter from 'views/alarm_manage/monitorPolicy/xsky_router.vue'
import xskyUser from 'views/alarm_manage/monitorPolicy/xsky_user.vue'
import xskyVolume from 'views/alarm_manage/monitorPolicy/xsky_volume.vue'
import cisco from 'views/alarm_manage/monitorPolicy/cisco.vue'
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
    label: '作用范围',
    prop: 'isGlobal',
    scopedSlots: { customRender: 'isGlobal' }
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
    dellDevice,
    dellVolume,
    dellDisk,
    k8sNode,
    k8sPod,
    hmcServer,
    hmcLpar,
    database,
    xskyFileSys,
    xskyBucket,
    xskyChache,
    xskyOsd,
    xskyPool,
    xskyRouter,
    xskyUser,
    xskyVolume,
    cisco,
    opServiceTable,
    easyServiceTable
  },
  data() {
    return {
      booleanFilter,
      statusFilter,
      waiteTimeFilter,
      alarmLevelFilter,
      alarmLevelColorFilter,
      resourceTypeMonitorFilter,
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
        this.ruleGroupIds.forEach((item) => {
          this.selectList.push({ id: item })
        })
        this.flag++
      }
      this.refreshId()
      getRuleGroup(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
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
    addSubmit() {
      this.refreshId()
      this.loading = true
      rulegroupsBinding({
        resourceId: this.resourceId,
        ruleGroupIds: this.idList,
        resourceType: this.resourceType
      }).then((data) => {
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
      if (
        this.detailData.resourceType == 'MONITOR_VCENTER_HOST' ||
        this.detailData.resourceType == 'MONITOR_CLOUDTOWER_HOST' ||
        this.detailData.resourceType == 'MONITOR_OPENSTACK_HOST' ||
        this.detailData.resourceType == 'MONITOR_EASYSTACK_HOST' ||
        this.detailData.resourceType == 'MONITOR_FUSIONCLOUD_HOST' ||
        this.detailData.resourceType == 'MONITOR_H3C_HOST'
      ) {
        this.type = 'HOST'
      }
      const arr = []
      this.detailData.rules.forEach((rule) => {
        const parent = arr.find((cur) => cur.name == rule.name && cur.tag == rule.tag)
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
        getDistriDetail(this.detailData.policyId).then((data) => {
          if (data.success) {
            this.policyData = Object.assign({}, data.data)
          }
        })
      }
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
