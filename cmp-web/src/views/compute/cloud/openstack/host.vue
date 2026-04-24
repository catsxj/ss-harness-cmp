<template>
  <div>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #cpuUsage="cpuUsage">
        <el-progress class="progress" :color="customColorMethod" text-inside :stroke-width="16" :percentage="cpuUsage ? cpuUsage : 0"></el-progress>
      </template>
      <template #memUsage="memUsage">
        <el-progress class="progress" :color="customColorMethod" text-inside :stroke-width="16" :percentage="memUsage ? memUsage : 0"></el-progress>
      </template>
      <template #onOffStatus="onOffStatus">
        <status-icon :type="statusOnColorFilter(onOffStatus)">
          {{ onOffStatus }}
        </status-icon>
      </template>
      <template #responseTime="responseTime">
        <span v-if="responseTime">{{ responseTime }}ms</span>
        <span v-else>未知</span>
      </template>
      <template #agent="val">
        <span v-if="val">已安装</span>
        <span v-else>未安装</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleMonitorDetail(record.id, record.name)"> 告警详情</el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click="bindIpmi(record)"> 绑定IPMI </el-dropdown-item>
            <el-dropdown-item @click="unbindIpmi(record)"> 解绑IPMI </el-dropdown-item>
            <el-dropdown-item @click="handleLink(record.id)"> 关联规则 </el-dropdown-item>
            <el-dropdown-item @click="handlePolicy(record)">
              {{ `${record.alarmEnable ? '屏蔽' : '开启'}告警` }}
            </el-dropdown-item>
            <el-dropdown-item @click="handleInstall(record)"> 安装Agent </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
    <el-dialog title="安装Agent" :close-on-click-modal="false" v-if="installVisible" v-model:visible="installVisible">
      <basic-form :model="installData" ref="installData">
        <basic-form-item label="端口：" prop="port" validate="required">
          <el-input v-model="installData.port" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="用户名：" prop="username">
          <el-input v-model="installData.username" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="密码：" prop="password">
          <el-input type="password" v-model="installData.password" auto-complete="off"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="installVisible = false">取消</el-button>
        <el-button type="primary" @click="installSubmit">确定</el-button>
      </div>
    </el-dialog>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <el-card>
          <el-tabs v-model="detailActiveName" class="m-t-n-md">
            <el-tab-pane name="overview">
              <span slot="label">资源总览</span>
              <overview ref="overview" v-if="detailActiveName == 'overview'" :detail-id="detailId" :detail-ip="detailIp"></overview>
            </el-tab-pane>
            <el-tab-pane name="cpu">
              <span slot="label">CPU</span>
              <cpu ref="cpu" v-if="detailActiveName == 'cpu'" :detail-id="detailId"></cpu>
            </el-tab-pane>
            <el-tab-pane name="mem">
              <span slot="label">内存</span>
              <mem ref="mem" v-if="detailActiveName == 'mem'" :detail-id="detailId"></mem>
            </el-tab-pane>
            <el-tab-pane name="net">
              <span slot="label">网络</span>
              <net ref="net" v-if="detailActiveName == 'net'" :detail-id="detailId"></net>
            </el-tab-pane>
            <el-tab-pane name="disk">
              <span slot="label">磁盘</span>
              <disk ref="disk" v-if="detailActiveName == 'disk'" :detail-id="detailId"></disk>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </common-detail>
    <bind :add-data="bindData" v-if="bindData.dialog"></bind>
  </div>
</template>

<script>
import { statusOnColorFilter } from '@/filters/index'
import crypto from 'utils/crypto'
import { getPolicyHosts, installTaskExporter, getHosts, patchHosts, getRuleGroupBind } from 'services/monitor'
import { getCluters } from 'services/platform/index'
import addPolicy from 'views/components/linkPolicy.vue'
import overview from './host_overview.vue'
import cpu from './host_cpu.vue'
import mem from './host_memory.vue'
import disk from './host_disk.vue'
import net from './host_network.vue'
import webSocket from '@/common/mixins/getGlobalSocket'
import bind from './bindipmi'
import { customColorMethod, handleStart } from 'views/data'
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
    prop: 'manageIp'
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
    label: '总VCPU(C)',
    prop: 'cpuTotal'
  },
  {
    label: '总内存(GB)',
    prop: 'memTotal'
  },
  // {
  //   label: '通断状态',
  //   prop: 'onOffStatus',
  //   scopedSlots: { customRender: 'onOffStatus' }
  // },
  // {
  //   label: '响应时长',
  //   prop: 'responseTime',
  //   scopedSlots: { customRender: 'responseTime' }
  // },
  {
    label: 'Agent',
    prop: 'agent',
    scopedSlots: { customRender: 'exporterInstalled' }
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
  mixins: [webSocket],
  components: {
    overview,
    cpu,
    mem,
    disk,
    net,
    bind,
    addPolicy
  },
  props: {},
  data() {
    return {
      statusOnColorFilter,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: 'IP', value: 'manageIp' },
        { type: 'Const', value: 'catalog', initValue: 'OPENSTACK' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId },
        { type: 'Select', label: '主机组', value: 'clusterId', data: [], service: { api: getCluters, params: { simple: true, params: JSON.stringify([{ param: { vendorId: this.$route.query.vendorId }, sign: 'EQ' }]) }, attr: 'data.rows' } }
      ],
      columns,
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
      detailData: {},
      detailId: null,
      detailIp: null,
      detailActiveName: 'overview',
      installVisible: false,
      installData: {},
      clusterData: [],
      loading: false,
      bindData: {
        dialog: false,
        data: {}
      },
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_OPENSTACK_HOST'
    }
  },
  methods: {
    bindIpmi(row) {
      getHosts(row.id).then((data) => {
        if (data.success) {
          data.data = data.data || {}
          this.bindData = {
            dialog: true,
            data: {
              hostId: row.id,
              ipmiIp: data.data.ipmiIp || '',
              username: data.data.username || '',
              password: data.data.password || ''
            }
          }
        }
      })
    },
    unbindIpmi(row) {
      this.$confirm('您确认要解绑IPMI嘛？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        patchHosts('/cms/v1/hosts/ipmi/unbind', {
          id: row.id
        }).then((data) => {
          this.$message.success({
            message: data.message,
            type: 'success'
          })
          this.getList()
        })
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('exporter.install.success') > -1) {
        this.getList()
      }
    },
    getClusterData() {
      getCluters({
        simple: true,
        params: JSON.stringify([
          {
            param: { vendorId: this.$route.query.vendorId },
            sign: 'EQ'
          }
        ])
      }).then((data) => {
        if (data.success) {
          this.clusterData = data.data.rows
        }
      })
    },
    getList() {
      this.loading = true
      this.refreshId()
      getPolicyHosts(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
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
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    handleLink(id, flag) {
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
      this.detailId = row.id
      this.detailIp = row.manageIp
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
    },
    handleInstall(row) {
      this.installData = {
        id: row.id,
        name: row.name,
        ip: row.manageIp,
        port: 22,
        username: 'root'
      }
      this.installVisible = true
    },
    installSubmit() {
      this.$refs.installData.validate((valid) => {
        if (valid) {
          const installData = JSON.parse(JSON.stringify(this.installData))
          if (installData.password) {
            installData.password = crypto.encrypt(installData.password)
          }
          installTaskExporter(installData).then((data) => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.installVisible = false
              this.getList()
            }
          })
        }
      })
    }
  },
  created() {}
}
</script>
