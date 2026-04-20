<template>
  <el-dialog title="关联资源" :visible.sync="addData.visible" width="1200px" v-if="addData.visible" append-to-body top="5vh">
    <AdvanceTable :card-border="false" :searchConfigs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" height="60vh">
      <template #selectable="val">
        <el-radio v-model="targetId" :label="val"> &nbsp;</el-radio>
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
      <template #os="val, record">
        <div v-if="record.vendorType == 'SMARTX' || record.vendorType == 'ZSTACK'">
          {{ record.osVersion ? record.osVersion : '' }}
        </div>
        <div v-else>
          {{ (record.osCategory ? record.osCategory : '') + ' ' + (record.osName ? record.osName : '') + ' ' + (record.osVersion ? record.osVersion : '') }}
        </div>
      </template>
      <template #memory="val"> {{ val }} GB </template>
    </AdvanceTable>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.visible = false">关 闭</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { taskRecordAssociate } from 'services/services/flow'
import { getVm } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      targetId: '',
      columns: [
        {
          width: '60px',
          label: '',
          prop: 'id',
          scopedSlots: { customRender: 'selectable' }
        },
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: 'IP',
          prop: 'privateIps',
          scopedSlots: { customRender: 'ip' }
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
          prop: 'os',
          scopedSlots: { customRender: 'os' }
        },
        {
          label: '平台类型',
          prop: 'vendorType'
        },
        {
          label: '所属平台',
          prop: 'vendorName'
        }
      ],
      searchConfigs: [
        { label: '名称', value: 'name', type: 'Input' },
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
        { value: 'isTemplate', type: 'Const', initValue: false },
        { value: 'isAssign', type: 'Const', initValue: false }
      ],
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      }
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      const res = await taskRecordAssociate({
        id: this.addData.id,
        targetId: this.targetId
      }).finally(() => (this.loading = false))
      if (!res.success) return
      this.$message.success(res.message)
      this.addData.visible = false
      this.$emit('success')
    },
    getList() {
      const params = JSON.parse(this.params.params)
      params.push({ param: { vendorType: this.addData.vendorType, vendorId: this.addData.vendorId }, sign: 'EQ' })
      getVm({
        ...this.params,
        params: JSON.stringify(params)
      }).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.selectList = []
          this.list.forEach((item) => {
            if (item.vendorType === 'SANGFOR' && item.privateIps) {
              item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map((item) => ({ address: Object.keys(item)[0] })))
            }
            if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
            if (item.publicIps) item.publicIps = JSON.parse(item.publicIps)
          })
        }
      })
    }
  }
}
</script>
