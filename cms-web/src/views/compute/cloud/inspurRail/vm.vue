<template>
  <div>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="vmColumns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="resourceMonitorTable">
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #privateIps="privateIps">
        <div v-if="privateIps">
          <div v-for="(item, index) in privateIps" :key="index">
            {{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}
          </div>
        </div>
      </template>
      <template #status="status">
        <status-icon :type="vmStatusColorFilter(status)">{{ vmStatusFilter(status) }} </status-icon>
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
            <el-dropdown-item @click.native="setIP(record)"> 设置监控IP </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <add-policy v-if="addFlag" resourceType="MONITOR_VCENTER_VM" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
    <el-dialog title="设置监控IP" :visible.sync="setIPFlag" v-if="setIPFlag">
      <el-row>
        <basic-form ref="setData" :model="setData" :status-icon="true">
          <el-col :span="24">
            <basic-form-item label="IP地址：" prop="ip" validate="required">
              <el-select clearable v-model="setData.ip">
                <el-option v-for="(item, index) in ipData" :key="index" :label="item.address" :value="item.address"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </basic-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="setIPFlag = false">取 消</el-button>
        <el-button type="primary" @click.native="setSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <detail :detail-id="detailId"></detail>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { statusOnColorFilter, vmStatusFilter, vmStatusColorFilter } from '@/filters/index'
import { getVms, setIps, getRuleGroupBind } from 'services/monitor/index.js'
import { vmColumns, customColorMethod, handleStart } from 'views/data'
import detail from './vm_detail.vue'
import addPolicy from 'views/components/linkPolicy.vue'
export default {
  components: {
    detail,
    addPolicy
  },
  data() {
    return {
      statusOnColorFilter,
      vmStatusFilter,
      vmStatusColorFilter,
      vmColumns,
      handleStart,
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
        { type: 'Const', value: 'vendorType', initValue: 'INSPURRAIL' },
        { type: 'Const', value: 'vendorId', initValue: this.$route.query.vendorId },
        { type: 'Const', value: 'isTemplate', initValue: false }
      ],
      customColorMethod,
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
      setData: {},
      ipData: [],
      setIPFlag: false,
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      biosUuid: ''
    }
  },
  methods: {
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
      this.handleStart(this, data, 'MONITOR_VCENTER_VM')
    },
    getDetail(row) {
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
        query: { id: id, name: name, type: 'MONITOR_VCENTER_VM' }
      })
    },
    setIP(row) {
      this.setData = {
        id: row.id,
        ip: row.monitorIp
      }
      this.ipData = row.privateIps
      this.setIPFlag = true
    },
    setSubmit() {
      this.$refs.setData.validate((valid) => {
        if (valid) {
          setIps(this.setData).then((data) => {
            this.$notify({
              message: data.message,
              type: 'success'
            })
            this.setIPFlag = false
            this.getList()
          })
        }
      })
    }
  },
  created() {}
}
</script>
