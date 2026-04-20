<template>
  <el-card>
    <div slot="header">
      <div>
        全局资源监测
        <!-- <span class="pull-right">最后更新时间：{{}}</span> -->
      </div>
      <div class="m-t">
        <el-alert :closable="false">汇总云管平台中全量云资源的真实使用情况以及成本占用数据，结合多种监控指标维度帮助用户有效了解平台运营层面的全局走势，以便及时采集相应优化举措，提升管理质量。</el-alert>
      </div>
    </div>
    <AdvanceTable :cardBorder="false" title="" :searchConfigs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total">
      <template v-slot:action>
        <el-button type="primary" @click="handllExport()"> 导出 </el-button>
        <!-- <el-button type="primary" @click="handllRefresh()"> 更新 </el-button> -->
      </template>

      <template #ip="val, record">
        <div v-if="record.vendorType == 'OPENSTACK' || record.vendorType == 'EASYSTACK' || record.vendorType == 'MANAGEONE' || record.vendorType == 'FUSIONCLOUD'">
          <span v-for="item in record.privateIpsList" :key="item.networkId">
            <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </span>
        </div>
        <div v-else-if="record.vendorType == 'VMWARE' || record.vendorType == 'INSPURRAIL' || record.vendorType == 'CNWARE' || record.vendorType == 'ZSTACK' || record.vendorType == 'CECSTACK' || record.vendorType == 'H3C' || record.vendorType == 'SANGFOR' || record.vendorType == 'CLOUDTOWER'">
          <div v-for="item in record.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
        </div>
        <div v-else-if="record.vendorType == 'USPHERE'">
          <div v-for="item in record.privateIpsList" :key="item.address || item.ip">
            <div>{{ item.address || item.ip }}</div>
            <div v-if="item.reserveIp">
              <div v-for="row in item.reserveIp" :key="row.id">{{ row.ip }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="record.vendorType == 'HUAWEI' || record.vendorType == 'HCSO'">
          <div v-for="item in record.privateIpsList" :key="item.address">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
        </div>
        <div v-else-if="record.vendorType == 'QCLOUD'">
          <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item.address }}</div>
        </div>
        <div v-else-if="record.vendorType == 'AZURE' || record.vendorType == 'AWS'">
          <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
        </div>
        <div v-else-if="record.vendorType == 'JDCLOUD'">
          <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item }}</div>
        </div>
        <div v-else-if="record.vendorType == 'VOLCENGINE'">
          <div v-if="JSON.parse(record.privateIps)[0].primaryIpAddress">{{ JSON.parse(record.privateIps)[0].primaryIpAddress }}(内网)</div>
          <div v-if="JSON.parse(record.privateIps)[0].eipAddress">{{ JSON.parse(record.privateIps)[0].eipAddress }}(公网)</div>
        </div>
        <div v-else-if="record.vendorType == 'SMARTX'">
          <div>{{ record.managerIp ? '(内网)' + record.managerIp : '--' }}</div>
        </div>
        <div v-else-if="record.vendorType == 'SANGFOR'">
          <div>{{ record.privateIps }}</div>
        </div>
        <div v-else-if="record.vendorType == 'SUGONCLOUD'">
          <div v-for="(item, index) in JSON.parse(record.privateIps)" :key="index">
            <div v-if="item.floatingAddress">公网：{{ item.floatingAddress }}</div>
            <div>内网：{{ item.fixedAddress }}</div>
          </div>
        </div>
        <div v-else>
          <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
        </div>
        <div v-if="record.floatingIp">(公网){{ record.floatingIp }}</div>
        <div v-if="record.vendorType == 'TENCENT' || record.vendorType == 'ALIYUN' || record.vendorType == 'AZURE' || record.vendorType == 'AWS' || record.vendorType == 'QCLOUD' || record.vendorType == 'CNWARE' || record.vendorType == 'CECSTACK' || record.vendorType == 'USPHERE'">
          <div v-for="(item, index) in record.publicIps" :key="index">(公网){{ item.address || item }}</div>
        </div>
      </template>
      <template #spec="val, record"> {{ (record.cpu ? record.cpu : 0) + 'C/' + (record.memory ? record.memory : 0) + 'GB/' }}{{ record.disk == null ? 0 : record.disk + 'GB' }} </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #memory="val"> {{ val }} GB </template>
    </AdvanceTable>
  </el-card>
</template>

<script>
import { getCloudVendor } from 'services/platform/index'
import { refreshGlobalResourceMonitoring, downloadGlobalResourceList, getGlobalResourceMonitoringCount } from '@/services/soa/costAnalysis'
import { getPolicyVms } from '@/services/monitor'
import { getProject } from 'services/system/project'
import dayjs from 'utils/day'
import Block from './components/Block.js'
import { getTenant, getUser } from 'services/system/tenant'
import { cloneDeep } from 'lodash-es'

export default {
  mixins: [Block],
  data() {
    return {
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      columns: [
        {
          width: '160px',
          label: '资源名称',
          prop: 'name'
        },
        {
          width: '200px',
          label: 'IP地址',
          prop: 'privateIps',
          sortable: 'custom',
          scopedSlots: { customRender: 'ip' }
        },
        {
          width: '120px',
          label: '规格',
          prop: 'spec',
          scopedSlots: { customRender: 'spec' }
        },
        {
          width: '110px',
          label: '存储总容量(GB)',
          prop: 'disk'
        },
        {
          label: '运行状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },

        {
          width: '90px',
          label: 'CPU利用率',
          prop: 'cpuUsage'
        },
        {
          width: '90px',
          label: '内存利用率',
          prop: 'memUsage'
        },
        {
          width: '140px',
          label: ' 磁盘读取速率(KB/s)',
          prop: 'diskRead'
        },
        {
          width: '140px',
          label: ' 磁盘写入速率(KB/s)',
          prop: 'diskWrite'
        },
        {
          width: '160px',
          label: '网络数据接收速率(KB/s)',
          prop: 'netReceived'
        },
        {
          width: '160px',
          label: '网络数据传输速率(KB/s)',
          prop: 'netTransmitted'
        },
        {
          width: '110px',
          label: '总成本消耗(元)',
          prop: 'totalCost'
        },
        {
          width: '115px',
          label: '当月成本消耗(元)',
          prop: 'monthCost'
        },
        {
          width: '115px',
          label: '季度成本消耗(元)',
          prop: 'quarterCost'
        },
        {
          width: '115px',
          label: '当年成本消耗(元)',
          prop: 'yearCost'
        },
        {
          label: '所属平台',
          prop: 'vendorName'
        },
        {
          width: '115px',
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '所属用户',
          prop: 'ownerName'
        },
        {
          width: '160px',
          label: '创建时间',
          prop: 'gmtCreate'
        },
        {
          width: '140px',
          label: '运行时长',
          prop: 'duration'
        }
      ],
      searchConfigs: [
        { label: '资源名称', value: 'name', type: 'Input' },
        { label: 'IP', value: 'privateIps', type: 'Input' },
        { type: 'Select', label: '所属平台', value: 'vendorId', data: [], service: { api: getCloudVendor, params: { simple: true }, attr: 'data.rows' } },
        { type: 'Select', label: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectId', data: [] },
        { type: 'Select', label: '所属租户', value: 'tenantId', data: [] },
        { type: 'Select', label: '所属用户', value: 'ownerId', data: [] },
        { value: 'isTemplate', type: 'Const', initValue: false }
      ]
    }
  },
  created() {
    this.getProjectList()
    this.getTenantList()
    this.getUserList()
  },
  methods: {
    getData() {
      const cloneParams = cloneDeep(this.params)
      cloneParams.params = JSON.parse(cloneParams.params)
      // const nulParam = { param: {}, sign: 'NUL' }
      Object.keys(cloneParams.params && cloneParams.params[0].param).map((key) => {
        const value = cloneParams.params[0].param[key]
        if (value === 'null' && key === 'ownerId') {
          cloneParams.params[0].param[key] = -1
        } else if (value === 'null' && (key === 'projectId' || key === 'tenantId')) {
          cloneParams.params[0].param[key] = 0
        }
      })
      // cloneParams.params.push(nulParam)

      cloneParams.params = JSON.stringify(cloneParams.params)
      getGlobalResourceMonitoringCount(cloneParams).then((res) => {
        setTimeout(() => {
          this.GeneratorBlockComponent([
            {
              name: '总成本消耗',
              value: res.data?.totle ?? '--',
              unit: '元'
            },
            {
              name: '当月成本消耗',
              value: res.data?.month ?? '--',
              unit: '元'
            },
            {
              name: '季度成本消耗',
              value: res.data?.quarter ?? '--',
              unit: '元'
            },
            {
              name: '当年成本消耗',
              value: res.data?.year ?? '--',
              unit: '元'
            }
          ])
        }, 500)
      })
      getPolicyVms(cloneParams).then((res) => {
        if (res.success) {
          this.list = res.data.rows.map((item) => {
            if (item.vendorType === 'SANGFOR' && item.privateIps) {
              item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map((item) => ({ address: Object.keys(item)[0] })))
            }
            if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
            if (item.publicIps) item.publicIps = JSON.parse(item.publicIps)
            // 当前时间 - 创建时间 = 运行时长
            // xx 天 xx 小时
            item.duration = item.gmtCreate ? dayjs().diff(dayjs(item.gmtCreate), 'day') + '天' + dayjs().diff(dayjs(item.gmtCreate), 'hour') + '小时' : '虚拟机不存在或已被删除'
            return item
          })
          this.total = res.data.total
        }
      })
    },

    handllExport() {
      downloadGlobalResourceList(this.params)
    },
    handllRefresh() {
      refreshGlobalResourceMonitoring()
    },
    getProjectList() {
      getProject({ simple: true }).then((res) => {
        if (res.success) {
          this.searchConfigs[3].data = res.data.rows
          this.searchConfigs[3].data.push({
            id: 'null',
            name: '其他'
          })
        }
      })
    },
    getTenantList() {
      getTenant({ simple: true }).then((res) => {
        if (res.success) {
          this.searchConfigs[4].data = res.data.rows
          this.searchConfigs[4].data.push({
            id: 'null',
            name: '其他'
          })
        }
      })
    },
    getUserList() {
      getUser({ simple: true }).then((res) => {
        if (res.success) {
          this.searchConfigs[5].data = res.data.rows
          this.searchConfigs[5].data.push({
            id: 'null',
            name: '其他'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './components/Block.scss';
</style>
