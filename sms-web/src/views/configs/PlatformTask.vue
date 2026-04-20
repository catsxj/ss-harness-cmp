<template>
  <AdvanceTable title="任务列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading"> </AdvanceTable>
</template>

<script>
import { getTasks } from 'services/system/platformTask'
const searchConfigs = [{ label: '名称', value: 'name', type: 'Input' }]
const columns = [
  {
    label: '名称',
    prop: 'name'
  },
  {
    label: '任务内容',
    prop: 'content'
  },
  {
    label: '任务结果',
    prop: 'result'
  },
  {
    label: '失败原因',
    prop: 'errorReason'
  },
  {
    label: '耗时',
    prop: 'cost'
  },
  {
    label: '开始时间',
    prop: 'gmtBegin'
  },
  {
    label: '结束时间',
    prop: 'gmtEnd'
  }
]
export default {
  data() {
    return {
      columns,
      loading: false,
      searchConfigs,
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      }
    }
  },
  methods: {
    async getList() {
      this.loading = true
      const data = await getTasks(this.params)
      this.loading = false
      if (data.success) {
        this.list = data.data.rows
        this.total = data.data.total
      }
    }
  }
}
</script>
