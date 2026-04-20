<template>
  <div class="wrapper">
    <AdvanceTable :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #name="val, record">
        <el-button type="text" @click="$router.push({ name: 'ServiceDisk', query: { id: record.id } })" :disabled="record.status == 'BUILDING'">{{ record.name }}</el-button>
      </template>
      <template #status="val, record">
        <status-icon :type="record.status | openstackServerColor">{{ record.status | openstackServer }} </status-icon>
      </template>
      <template #regionName="val, record">
        <span>{{ record.regionName }}</span>
      </template>
      <template #bootVolume="val, record">
        {{ record.bootVolume | isTrue }}
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
import { getVolume } from 'services/platform/index'
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
    label: '硬盘状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '容量(GB)',
    prop: 'size'
  },
  {
    label: '区域',
    prop: 'regionName',
    scopedSlots: { customRender: 'regionName' }
  },
  {
    label: '是否为启动卷',
    prop: 'bootVolume',
    scopedSlots: { customRender: 'bootVolume' }
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
      getVolume(this.params).then(data => {
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
