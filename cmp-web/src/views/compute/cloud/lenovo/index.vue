<template>
  <el-card class="wrapper">
    <div slot="header" class="clearfix">
      <div class="detail-header">
        <span class="detail-back" @click="goBackCloud"><i class="iconfont icon-left-arrow"></i> 返回</span>
        <span class="line"></span>
        <span class="title">{{ $route.query.vendorName }}</span>
      </div>
    </div>
    <el-tabs ref="resourceMonitorTab" type="card" value="vm">
      <el-tab-pane name="vm" label="云主机">
        <div v-if="!detailFlag">
          <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
            <template #name="val, record">
              <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
            </template>
            <template #privateIps="privateIps, record">
              <div v-for="item in record.privateIps" :key="item">(内网){{ item }}</div>
              <div v-for="item in record.publicIps" :key="item">(公网){{ item.address || item }}</div>
              <div v-if="record.floatingIp">(公网){{ record.floatingIp }}</div>
            </template>
            <template #status="status">
              <status-icon :type="vmStatusColorFilter(status)">
                {{ openstackServerFilter(status) }}
              </status-icon>
            </template>
            <template #spec="val, record"> {{ (record.cpu ? record.cpu : 0) + 'C/' + (record.memory ? record.memory : 0) + 'GB/' }}{{ record.disk == null ? 0 : record.disk + 'GB' }} </template>
            <template #system="val, record">
              <div>
                {{ (record.osCategory ? record.osCategory : '') + ' ' + (record.osName ? record.osName : '') + ' ' + (record.osVersion ? record.osVersion : '') }}
              </div>
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
        </div>
        <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
          <div slot="custom_content">
            <detail :detail-id="detailId" :instance-id="instanceId"></detail>
          </div>
        </common-detail>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import { vmStatusColorFilter, openstackServerFilter } from '@/filters/index'
import { getVms, getRuleGroupBind } from 'services/monitor/index.js'
import detail from './detail.vue'
import { customColorMethod, handleStart } from 'views/data'
import addPolicy from 'views/components/linkPolicy.vue'

export default {
  components: {
    detail,
    addPolicy
  },
  data() {
    return {
      vmStatusColorFilter,
      openstackServerFilter,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: 'IP', value: 'privateIps' },
        {
          type: 'Select',
          label: '状态',
          value: 'status',
          data: [
            { id: 'RUNNING', name: '运行中' },
            { id: 'BUILDING', name: '创建中' },
            { id: 'STOPPED', name: '关机' },
            { id: 'SUSPENDED', name: '挂起' },
            { id: 'EXCEPTION', name: '异常' },
            { id: 'UNKNOWN', name: '断开' }
          ]
        },
        { type: 'Const', value: 'vendorType', initValue: 'LENOVO' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId },
        { type: 'Const', value: 'isTemplate', initValue: false }
      ],
      columns: [
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
          prop: 'privateIps',
          scopedSlots: { customRender: 'privateIps' }
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '规格',
          prop: 'spec',
          scopedSlots: { customRender: 'spec' }
        },
        {
          label: '操作系统',
          prop: 'system',
          scopedSlots: { customRender: 'system' }
        },
        {
          label: 'CPU利用率',
          prop: 'cpuUsage',
          scopedSlots: { customRender: 'cpuUsage' }
        },
        {
          label: '内存利用率',
          prop: 'memUsage',
          scopedSlots: { customRender: 'memUsage' }
        },
        {
          label: '所属租户',
          prop: 'tenantName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '操作',
          disabled: true,
          prop: 'id',
          width: '160px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      customColorMethod,
      handleStart,
      params: {
        page: 1,
        rows: 10
      },
      list: [],
      total: 0,
      idList: [],
      selectList: [],
      detailFlag: false,
      detailId: null,
      instanceId: '',
      detailData: {},
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_LENOVO_VM'
    }
  },
  methods: {
    goBackCloud() {
      history.go(-1)
    },
    getList() {
      this.refreshId()
      this.loading = true
      getVms(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            item.cpuUsage = Number(item.cpuUsage)
            item.memUsage = Number(item.memUsage)
            if (item.privateIps) {
              item.privateIps = JSON.parse(item.privateIps)
            }
            if (item.publicIps) {
              item.publicIps = JSON.parse(item.publicIps)
            }
            switch (item.onOffStatus) {
              case '0':
                item.onOffStatus = '断开'
                break
              case '1':
                item.onOffStatus = '正常'
                break
              default:
                item.onOffStatus = '未知'
                break
            }
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
        selection.forEach((item) => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
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
      this.detailId = row.id
      this.instanceId = row.instanceId
      this.detailData = {
        name: row.name
      }
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
<style scoped>
.detail-header .detail-back {
  color: #46abf1;
  cursor: pointer;
}
.detail-header .line {
  position: relative;
  top: 4px;
  margin: 0 6px;
  height: 14px;
  width: 1px;
  display: inline-block;
  background-color: #b5b5b5;
}
</style>
