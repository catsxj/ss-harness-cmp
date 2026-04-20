<template>
  <div class="wrapper">
    <div>
      <AdvanceTable :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
        <template #name="val, record">
          <el-button type="text" @click="$router.push({ name: 'ServiceEcs', query: { id: record.id } })" :disabled="record.status == 'BUILDING'">{{ record.name }}</el-button>
        </template>
        <template #address="val, record">
          <div v-if="record.vendorType == 'EASYSTACK'">
            <span v-for="item in record.privateIpsList" :key="item.networkId">
              <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
            </span>
          </div>
          <div v-else-if="record.vendorType == 'VMWARE' || record.vendorType == 'INSPURRAIL' || record.vendorType == 'CNWARE' || record.vendorType == 'ZSTACK' || record.vendorType == 'CECSTACK' || record.vendorType == 'H3C' || record.vendorType == 'SANGFOR' || record.vendorType == 'CLOUDTOWER'">
            <div v-for="item in record.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </div>
          <div v-else-if="record.vendorType == 'SMARTX' || record.vendorType == 'CLOUDTOWER' || record.vendorType == 'ARCHEROS'">
            <div>{{ record.managerIp ? '(内网)' + record.managerIp : '--' }}</div>
          </div>
          <div v-else>
            <template v-if="record.privateIpsList">
              <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
            </template>
            <template v-else>{{ record.managerIp ? '(内网)' + record.managerIp : '--' }}</template>
          </div>
          <div v-if="record.floatingIp">(公网){{ record.floatingIp }}</div>
        </template>
        <template #status="val, record">
          <status-icon :type="record.status | openstackServerColor">{{ record.status | openstackServer }} </status-icon>
        </template>
        <template #createTime="val, record">
          <span>
            {{ record.osName || record.osVersion ? (record.osName ? record.osName : '') + ' ' + (record.osVersion ? record.osVersion : '') : record.osCategory }}
          </span>
        </template>
        <template #region="val, record">
          <span>{{ record.regionName }}</span>
        </template>
      </AdvanceTable>
    </div>
  </div>
</template>

<script>
import { getVm } from 'services/platform/index'
const searchConfigs = [
  { type: 'Input', label: '名称', value: 'name' },
  { type: 'Input', label: 'IP', value: 'privateIps' }
]
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: 'IP',
    prop: 'address',
    scopedSlots: { customRender: 'address' }
  },
  {
    label: '当前状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '操作系统及版本',
    prop: 'createTime',
    scopedSlots: { customRender: 'createTime' }
  },
  {
    label: '区域',
    prop: 'regionId',
    scopedSlots: { customRender: 'region' }
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  }
]
export default {
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      listQuery: {
        name: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      searchConfigs,
      columns
    }
  },
  methods: {
    getList() {
      this.loading = true
      const object = JSON.parse(this.params.params)
      object.push({ param: { isRecycle: 0, resourceGroupId: this.detail.id }, sign: 'EQ' })
      this.params.params = JSON.stringify(object)
      getVm(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.selectList = []
          this.list.forEach(item => {
            if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
            if (item.publicIps) item.publicIps = JSON.parse(item.publicIps)
          })
        }
        this.loading = false
      })
    }
  }
}
</script>
<style scoped></style>
