<template>
  <!-- TODO: cmp-element - 自研包在 compat 层处理：common-detail / common-detail-item / AdvanceTable / status-icon -->
  <common-detail :title="detail.id + ''" @goBack="goBack">
    <template #item_container>
      <common-detail-item label="总任务数">{{ detail.total }}</common-detail-item>
      <common-detail-item label="已完成任务数">{{ detail.completeCnt }}</common-detail-item>
      <common-detail-item label="任务进度">
        <el-progress :percentage="getProgressDetail(detail)"></el-progress>
      </common-detail-item>
      <common-detail-item label="执行状态">
        <status-icon :type="getStatus('color', detail.status)">
          {{ getStatus('text', detail.status) }}
        </status-icon>
      </common-detail-item>
      <common-detail-item label="执行结果">{{ detail.result }}</common-detail-item>
      <common-detail-item label="执行人">{{ detail.creator }}</common-detail-item>
      <common-detail-item label="开始时间">{{ detail.startTime }}</common-detail-item>
      <common-detail-item label="结束时间">{{ detail.endTime }}</common-detail-item>
      <common-detail-item label="任务耗时(ms)">{{ detail.used }}</common-detail-item>
    </template>
    <el-tabs value="task">
      <el-tab-pane name="task">
        <AdvanceTable title="任务列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
          <template #status="status">
            <status-icon :type="getStatus('color', status)">
              {{ getStatus('text', status) }}
            </status-icon>
          </template>
          <template #percent="{ val, record }">
            <el-progress :percentage="getProgress(record)"></el-progress>
          </template>
          <template #operate="{ val, record }">
            <el-button type="text" :disabled="record.status !== 'FAILED'" @click="refreshItem(detail.id, record.id)">重试</el-button>
          </template>
        </AdvanceTable>
      </el-tab-pane>
    </el-tabs>
  </common-detail>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { getDetailList, migrationById } from 'services/system/migration'
import { getStatus } from './configs'

interface DetailData {
  id: number | string
  total?: number
  completeCnt?: number
  totalCnt?: number
  status?: string
  result?: string
  creator?: string
  startTime?: string
  endTime?: string
  used?: number
  [key: string]: unknown
}

const props = defineProps<{ detail: DetailData }>()
const emit = defineEmits<{ goBack: [] }>()

const columns = [
  { label: '任务名称', prop: 'name' },
  { label: '执行状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '任务进度', prop: 'percent', scopedSlots: { customRender: 'percent' } },
  { label: '执行结果', prop: 'result' },
  { label: '开始时间', prop: 'startTime' },
  { label: '结束时间', prop: 'endTime' },
  { label: '任务耗时(ms)', prop: 'used' },
  { label: '操作', width: '220px', scopedSlots: { customRender: 'operate' } }
]

const searchConfigs = [
  { type: 'Input', value: 'name', label: '任务名称' },
  {
    type: 'Select',
    value: 'status',
    label: '执行状态',
    data: [
      { id: 'SUCCEED', name: '执行成功' },
      { id: 'FAILED', name: '执行失败' },
      { id: 'RUNNING', name: '正在执行' },
      { id: 'WAITING', name: '等待执行' },
      { id: 'INTERRUPTED', name: '打断执行' }
    ]
  }
]

// TODO: type - 迁移任务行类型后续补 interface
const list = ref<any[]>([])
const params = reactive<Record<string, any>>({ page: 1, rows: 10 })
const total = ref(0)
const loading = ref(false)
const interNum = ref<number | null>(null)

async function getList() {
  loading.value = true
  const res = await getDetailList(props.detail.id as any, params)
  if (res.success) {
    list.value = res.data.rows
    total.value = res.data.total
  }
  loading.value = false
}

getList()

function refresh() {
  interNum.value = window.setInterval(() => {
    getList()
  }, 5000)
}
refresh()

function goBack() {
  emit('goBack')
}

onBeforeUnmount(() => {
  if (interNum.value != null) clearInterval(interNum.value)
})

async function refreshItem(recordId: number | string, taskId: number | string) {
  loading.value = true
  const res = await migrationById(recordId as any, taskId as any)
  if (res.success) {
    ElMessage.success(res.message)
  }
  loading.value = false
}

function getProgress(row: any) {
  return row.percent
}

function getProgressDetail({ totalCnt = 0, completeCnt = 0 }: { totalCnt?: number; completeCnt?: number }) {
  return Number(((completeCnt / totalCnt) * 100).toFixed(1))
}
</script>

<style></style>
