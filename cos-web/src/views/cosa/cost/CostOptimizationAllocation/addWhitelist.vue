<template>
  <el-dialog title="新增白名单对象" :close-on-click-modal="false" :visible.sync="dialog.visible" width="1200px" top="5vh">
    <AdvanceTable :cardBorder="false" :searchConfigs="searchConfigs" title="" :data="list" :params="params" :columns="columns" :get-list="getData" :total="total" @selection-change="selectChange">
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
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="handleSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getVm, getCloudVendor } from 'services/platform/index'
import { getProject } from 'services/system/project'
import { addWhiteList } from '@/services/soa/costAnalysis'
export default {
  name: 'Dispose',
  props: {
    dialog: {
      type: Object,
      default: () => {
        return {
          visible: false,
          data: {}
        }
      }
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      columns: [
        {
          type: 'selection'
        },
        {
          label: '资源名称',
          prop: 'name'
        },
        {
          label: 'IP地址',
          prop: 'privateIps',
          sortable: 'custom',
          scopedSlots: { customRender: 'ip' }
        },
        {
          label: '规格',
          prop: 'spec',
          scopedSlots: { customRender: 'spec' }
        },
        {
          label: '存储总容量',
          prop: 'disk'
        },
        {
          label: '运行状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
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
          prop: 'gmtCreate'
        }
      ],
      searchConfigs: [
        { label: '资源名称', value: 'name', type: 'Input' },
        { label: 'IP', value: 'privateIps', type: 'Input' },
        {
          label: '状态',
          value: 'status',
          type: 'Select',
          data: [
            { id: 'RUNNING', name: '运行中' },
            { id: 'BUILDING', name: '创建中' },
            { id: 'STOPPED', name: '关机' },
            { id: 'SUSPENDED', name: '挂起' },
            { id: 'EXCEPTION', name: '异常' },
            { id: 'UNKNOWN', name: '断开' }
          ]
        },
        { type: 'Select', label: '所属平台', value: 'vendorId', data: [], service: { api: getCloudVendor, params: { simple: true }, attr: 'data.rows' } },
        { type: 'Select', label: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectId', data: [], service: { api: getProject, params: { simple: true }, attr: 'data.rows' } },
        { value: 'isTemplate', type: 'Const', initValue: false },
        { type: 'Const', label: '是否白名单', initValue: 0, value: 'isWhiteList' }
      ],
      selected: []
    }
  },
  methods: {
    selectChange(rows) {
      this.selected = rows
    },
    getData() {
      getVm(this.params).then((res) => {
        this.list = res.data.rows.map((item) => {
          if (item.vendorType === 'SANGFOR' && item.privateIps) {
            item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map((item) => ({ address: Object.keys(item)[0] })))
          }
          if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
          if (item.publicIps) item.publicIps = JSON.parse(item.publicIps)
          return item
        })
        this.total = res.data.total
      })
    },
    handleSubmit() {
      this.loading = true
      addWhiteList({ params: this.selected.map((item) => item.id) })
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.$emit('success')
            this.dialog.visible = false
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
