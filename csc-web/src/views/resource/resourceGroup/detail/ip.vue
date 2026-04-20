<template>
  <div class="wrapper">
    <AdvanceTable :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #name="val, record">
        <el-button type="text" @click="$router.push({ name: 'ServiceVpc', query: { id: record.id } })" :disabled="record.status == 'BUILDING'">{{ record.name }}</el-button>
      </template>
      <template #regionName="val, record">
        <span>{{ record.regionName }}</span>
      </template>
      <template #CIDR="val, record">
        <div v-for="(item, index) in record.cidr" :key="index">{{ item }}</div>
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
import { getVpc } from 'services/platform/index'
const searchConfigs = [
  { type: 'Input', label: '名称', value: 'name' },
  { type: 'Const', value: 'resourceGroupId', initValue: '' }
]
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '区域',
    prop: 'regionName',
    scopedSlots: { customRender: 'regionName' }
  },
  {
    label: 'CIDR',
    prop: 'CIDR',
    scopedSlots: { customRender: 'CIDR' }
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
      listQuery: {
        name: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      searchConfigs,
      columns,
      loading: false
    }
  },
  created() {
    this.searchConfigs[1].initValue = this.detail.id
  },
  methods: {
    getList() {
      this.loading = true
      getVpc(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows.map(item => {
            return {
              ...item,
              cidr: item.cidr ? JSON.parse(item.cidr) : []
            }
          })
          this.total = data.data.total
        }
        this.loading = false
      })
    }
  }
}
</script>
<style scoped></style>
