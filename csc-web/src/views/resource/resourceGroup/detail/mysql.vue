<template>
  <div class="wrapper">
    <AdvanceTable :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #name="val, record">
        <el-button type="text" @click="$router.push({ name: 'ServiceMySql', query: { id: record.id } })" :disabled="record.status == 'BUILDING'">{{ record.name }}</el-button>
      </template>
      <template #status="val, record">
        <status-icon :type="record.status | mysqlStatusColor">{{ record.status | mysqlStatus }} </status-icon>
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
import { getMysql } from 'services/platform/azure'
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
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '版本',
    prop: 'version'
  },
  {
    label: '区域',
    prop: 'regionName'
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
      getMysql(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
        this.loading = false
      })
    }
  }
}
</script>
<style scoped></style>
