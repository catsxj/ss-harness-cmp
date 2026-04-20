<template>
  <div>
    <AdvanceTable :cardBorder="false" :searchConfigs="searchConfigs" title="" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total" @selection-change="selectChange">
      <template v-slot:action>
        <el-button type="ghost" @click="handllExport()"> 导出 </el-button>
        <el-button type="ghost" @click="handleOpenDispose()" :disabled="!selectList.length">处置</el-button>
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
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #isHandle="val"> {{ val ? '已处置' : '未处置' }} </template>
      <template #operate="val, record">
        <el-button type="text" :disabled="record.isHandle" @click="handleOpenDispose(record)">处置</el-button>
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
import { getCloudVendor } from 'services/platform/index'
import { getProject } from 'services/system/project'
import { downloadChecklist, getChecklist, disposeChecklist } from '@/services/soa/costAnalysis'
import dayjs from 'utils/day'
export default {
  name: 'CheckList',
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
          type: 'selection',
          selectable(row) {
            return !row.isHandle
          }
        },
        {
          label: '资源名称',
          width: '140px',
          prop: 'name'
        },
        {
          label: '处置状态',
          prop: 'isHandle',
          scopedSlots: { customRender: 'isHandle' }
        },
        {
          label: 'IP地址',
          prop: 'privateIps',
          sortable: 'custom',
          width: '140px',
          scopedSlots: { customRender: 'ip' }
        },
        {
          label: '规格',
          width: '100px',
          prop: 'spec'
        },
        {
          label: '存储总容量(GB)',
          width: '110px',
          prop: 'disk'
        },
        {
          label: '运行状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '命中规则',
          prop: 'ruleName'
        },
        {
          label: 'CPU利用率',
          width: '90px',
          prop: 'cpu'
        },
        {
          label: '内存利用率',
          width: '90px',
          prop: 'mem'
        },
        {
          label: '总成本消耗(元)',
          prop: 'totalCost',
          width: '110px'
        },
        {
          label: '当月成本消耗(元)',
          prop: 'monthCost',
          width: '115px'
        },
        {
          label: '季度成本消耗(元)',
          prop: 'quarterCost',
          width: '115px'
        },
        {
          label: '当年成本消耗(元)',
          prop: 'yearCost',
          width: '115px'
        },
        {
          label: '所属平台',
          width: '120px',
          prop: 'vendorName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          width: '120px',
          prop: 'projectName'
        },
        {
          label: '所属用户',
          width: '110px',
          prop: 'ownerName'
        },
        {
          label: '创建时间',
          width: '160px',
          prop: 'gmtCreate'
        },
        {
          label: '运行时长',
          width: '140px',
          prop: 'duration'
        },
        {
          label: '操作',
          width: '80px',
          scopedSlots: { customRender: 'operate' },
          fixed: 'right'
        }
      ],
      searchConfigs: [
        { label: '资源名称', value: 'name', type: 'Input' },
        { label: 'IP', value: 'ip', type: 'Input' },
        { type: 'Select', label: '所属平台', value: 'vendorId', data: [], service: { api: getCloudVendor, params: { simple: true }, attr: 'data.rows' } },
        { type: 'Select', label: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectId', data: [], service: { api: getProject, params: { simple: true }, attr: 'data.rows' } }
      ],
      selectList: []
    }
  },
  methods: {
    getParams() {
      const { params, page, rows } = this.params
      const newParams = { page, rows }
      JSON.parse(params || '[]').map((item) => {
        Object.keys(item.param).map((key) => {
          newParams[key] = item.param[key]
        })
      })
      return newParams
    },
    getData() {
      getChecklist(this.getParams()).then((res) => {
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
    selectChange(rows) {
      this.selectList = rows
    },
    async handleOpenDispose(record) {
      const ids = record ? [record.id] : this.selectList.map(({ id }) => id)
      const res = await disposeChecklist(ids)
      if (!res.success) return
      this.$message.success(res.message)
      this.getData()
    },
    handllExport() {
      const params = this.getParams()
      delete params.page
      delete params.rows
      downloadChecklist(params)
    }
  }
}
</script>
