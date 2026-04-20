<template>
  <div class="wrapper">
    <div v-if="!detailFlag">
      <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="containerMonitorTable">
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #schedulable="val">
          {{ booleanFilter(val) }}
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
    </div>
    <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <el-card>
          <el-tabs v-model="detailActiveName" class="m-t-n-md">
            <el-tab-pane name="overview">
              <span slot="label">资源总览</span>
              <overview ref="overview" v-if="detailActiveName == 'overview'" :detail-name="detailName" :detail-id="detailId"></overview>
            </el-tab-pane>
            <el-tab-pane name="cpu">
              <span slot="label">CPU</span>
              <cpu ref="cpu" v-if="detailActiveName == 'cpu'" :detail-name="detailName"></cpu>
            </el-tab-pane>
            <el-tab-pane name="mem">
              <span slot="label">内存</span>
              <mem ref="mem" v-if="detailActiveName == 'mem'" :detail-name="detailName"></mem>
            </el-tab-pane>
            <el-tab-pane name="net">
              <span slot="label">网络</span>
              <net ref="net" v-if="detailActiveName == 'net'" :detail-name="detailName"></net>
            </el-tab-pane>
            <el-tab-pane name="disk">
              <span slot="label">磁盘</span>
              <disk ref="disk" v-if="detailActiveName == 'disk'" :detail-name="detailName"></disk>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { booleanFilter } from '@/filters/index'
import { getRuleGroupBind } from 'services/monitor/index.js'
import { getNode } from 'services/monitor/kubernetes'
import overview from './node_overview.vue'
import cpu from './node_cpu.vue'
import mem from './node_memory.vue'
import disk from './node_disk.vue'
import net from './node_network.vue'
import { handleStart } from 'views/data'
import addPolicy from 'views/components/linkPolicy.vue'
export const columns = [
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
    label: 'IP',
    prop: 'nodeIp'
  },
  {
    label: '类型',
    prop: 'role'
  },
  {
    label: '可否调度',
    prop: 'schedulable',
    scopedSlots: { customRender: 'schedulable' }
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
    cpu,
    mem,
    disk,
    net,
    addPolicy
  },
  data() {
    return {
      booleanFilter,
      handleStart,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId }
      ],
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
      detailName: null,
      detailId: null,
      detailActiveName: 'overview',
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_KUBERNETES_NODE'
    }
  },
  methods: {
    getList() {
      this.refreshId()
      this.loading = true
      getNode(this.params).then((data) => {
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
    getDetail(row) {
      this.detailName = row.name
      this.detailId = row.id
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
        query: { id: id, name: name, type: 'KUBENODE' }
      })
    }
  },
  created() {}
}
</script>
