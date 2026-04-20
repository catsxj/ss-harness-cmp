<template>
  <!-- TODO: cmp-element - 自研包在 compat 层处理：AdvanceTable -->
  <AdvanceTable title="任务列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading"> </AdvanceTable>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getTasks } from 'services/system/platformTask'

const searchConfigs = [{ label: '名称', value: 'name', type: 'Input' }]
const columns = [
  { label: '名称', prop: 'name' },
  { label: '任务内容', prop: 'content' },
  { label: '任务结果', prop: 'result' },
  { label: '失败原因', prop: 'errorReason' },
  { label: '耗时', prop: 'cost' },
  { label: '开始时间', prop: 'gmtBegin' },
  { label: '结束时间', prop: 'gmtEnd' }
]

const loading = ref(false)
// TODO: type - 任务行类型后续补 interface
const list = ref<any[] | null>(null)
const total = ref<number | null>(null)
const params = reactive<Record<string, any>>({ page: 1, rows: 10 })

async function getList() {
  loading.value = true
  const data = await getTasks(params)
  loading.value = false
  if (data.success) {
    list.value = data.data.rows
    total.value = data.data.total
  }
}
</script>
