<template>
  <el-card header="选择虚拟机">
    <AdvanceTable class="m-b" :searchConfigs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #name="val, record">
        <el-radio v-model="vm" :label="record.id" @change="vmChange(record)">{{ val }}</el-radio>
      </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #spec="val, record">
        {{ (record.cpu ? record.cpu : 0) + 'C/' + (record.memory ? record.memory : 0) + 'GB' }}
      </template>
      <template #disk="val, record">
        {{ record.disk == null ? 0 : record.disk }}
      </template>
    </AdvanceTable>
  </el-card>
</template>

<script lang="ts">
import { defineComponent, ref, unref } from '@vue/composition-api'
import useTable from '@/common/hooks/useTable'
// import { vmTenants, getTenantCloudVendor } from 'services/platform/index';
import { vmTenants } from 'services/platform/index'
import store from '@/store'
const searchConfigs = [
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
  // { label: '所属平台', value: 'vendorId', type: 'Select', data: [], service: { api: getTenantCloudVendor, params: { simple: true }, attr: 'data.rows' } },
  { value: 'isRecycle', type: 'Const', initValue: 'false' },
  { value: 'isTemplate', type: 'Const', initValue: 'false' }
]
const columns = [
  {
    label: '名称',
    prop: 'name',
    sortable: 'custom',
    width: '300px',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: 'IP',
    prop: 'managerIp',
    sortable: 'custom'
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
    label: '存储空间/GB',
    prop: 'disk',
    scopedSlots: { customRender: 'disk' }
  },
  {
    label: '云平台',
    prop: 'vendorName'
  },
  {
    label: '过期时间',
    prop: 'expiredTime'
  },
  {
    label: '申请人',
    prop: 'ownerName'
  },
  {
    label: store.getters.systemConfig.projectConfigLabel,
    prop: 'projectName'
  },
  {
    label: '使用人',
    prop: 'menderName'
  }
]

export default defineComponent({
  name: '',
  setup() {
    const vm = ref()
    const vmData: any = ref(null)
    const { list, params, getList, total, loading } = useTable({
      getService: vmTenants,
      afterGetList() {
        list.value = list.value.map((item: any) => {
          if (item.vendorType === 'SANGFOR' && item.privateIps) {
            item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map((item) => ({ address: Object.keys(item)[0] })))
          }
          if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
          if (item.publicIps) item.publicIps = JSON.parse(item.publicIps)
          return item
        })
      }
    })
    function vmChange(val: object) {
      vmData.value = val
    }
    return { list, params, getList, total, columns, loading, searchConfigs, vm, vmChange, vmData }
  }
})
</script>
<style lang="scss" scoped>
.el-card {
  margin: 0px 50px;
}
</style>
