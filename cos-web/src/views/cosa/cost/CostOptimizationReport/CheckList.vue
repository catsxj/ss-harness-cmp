<template>
  <AdvanceTable :cardBorder="false" title="" :searchConfigs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total">
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
    <template #optimizeType="val">
      {{ val | statusList }}
    </template>
    <template #beforeSpec="val, record"> {{ record.beforCpu }}C/{{ record.beforMem }}GB </template>
    <template #afterSpec="val, record"> {{ record.afterCpu }}C/{{ record.afterMem }}GB </template>
    <template #memory="val"> {{ val }} GB </template>
  </AdvanceTable>
</template>

<script>
import { getCloudVendor } from 'services/platform/index'
import { getCostOptimizationMonth } from '@/services/soa/costAnalysis'
import { getProject } from 'services/system/project'
import dayjs from 'utils/day'
const statusList = [
  {
    name: '变更',
    id: 'change'
  },
  {
    name: '清退',
    id: 'unsubscribe'
  }
]
export default {
  name: 'CheckList',
  props: {
    detail: {
      type: Object,
      default: () => {}
    }
  },
  filters: {
    statusList(val) {
      return statusList.find((item) => item.id === val)?.name || 'val'
    }
  },
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
          label: '资源名称',
          prop: 'serverName'
        },
        {
          label: 'IP地址',
          prop: 'privateIps',
          sortable: 'custom',
          scopedSlots: { customRender: 'ip' }
        },
        {
          label: '优化类型',
          prop: 'optimizeType',
          scopedSlots: { customRender: 'optimizeType' }
        },
        {
          label: '优化完成时间',
          prop: 'optimizeTime'
        },
        {
          label: '优化前规格',
          prop: 'beforeSpec',
          scopedSlots: { customRender: 'beforeSpec' }
        },
        {
          label: '优化后规格',
          prop: 'afterSpec',
          scopedSlots: { customRender: 'afterSpec' }
        },
        {
          label: '优化前存储总容量(GB)',
          prop: 'beforDisk'
        },
        {
          label: '优化后存储总容量(GB)',
          prop: 'afterDisk'
        },
        {
          label: '所属平台',
          prop: 'vendorName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '所属用户',
          prop: 'ownerName'
        },
        {
          label: '创建时间',
          prop: 'createDate'
        }
      ],
      searchConfigs: [
        { label: '资源名称', value: 'serverName', type: 'Input' },
        { label: 'IP', value: 'privateIps', type: 'Input' },
        { type: 'Select', label: '所属平台', value: 'vendorId', data: [], service: { api: getCloudVendor, params: { simple: true }, attr: 'data.rows' } },
        { type: 'Select', label: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectId', data: [], service: { api: getProject, params: { simple: true }, attr: 'data.rows' } },
        {
          type: 'Select',
          label: '优化类型',
          value: 'optimizeType',
          data: statusList
        },
        { label: '报表ID', value: 'optimizeTime', type: 'DateRange', initValue: [dayjs(this.detail.month).startOf('month').format('YYYY-MM-DD 00:00:00'), dayjs(this.detail.month).endOf('month').format('YYYY-MM-DD 23:59:59')] }
      ]
    }
  },

  methods: {
    getData() {
      getCostOptimizationMonth(this.params).then((res) => {
        if (res.success) {
          this.list = res.data.data.map((item) => {
            item.beforMem = item.beforMem * 1
            item.afterMem = item.afterMem * 1
            if (item.vendorType === 'SANGFOR' && item.privateIps) {
              item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map((item) => ({ address: Object.keys(item)[0] })))
            }
            if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
            if (item.publicIps) item.publicIps = JSON.parse(item.publicIps)
            return item
          })
          this.total = res.data.total
        }
      })
    }
  }
}
</script>
