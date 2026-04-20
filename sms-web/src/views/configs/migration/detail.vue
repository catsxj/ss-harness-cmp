<template>
  <common-detail :title="detail.id + ''" @goBack="goBack">
    <template v-slot:item_container>
      <common-detail-item label="总任务数">{{ detail.total }}</common-detail-item>
      <common-detail-item label="已完成任务数">{{ detail.completeCnt }}</common-detail-item>
      <common-detail-item label="任务进度">
        <template>
          <el-progress :percentage="getProgressDetail(detail)"></el-progress>
        </template>
      </common-detail-item>
      <common-detail-item label="执行状态">
        <template>
          <status-icon :type="getStatus('color', detail.status)">
            {{ getStatus('text', detail.status) }}
          </status-icon>
        </template>
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
          <template #percent="val, record">
            <el-progress :percentage="getProgress(record)"></el-progress>
          </template>
          <template #operate="val, record">
            <el-button type="text" :disabled="record.status !== 'FAILED'" @click="refreshItem(detail.id, record.id)">重试</el-button>
          </template>
        </AdvanceTable>
      </el-tab-pane>
    </el-tabs>
  </common-detail>
</template>

<script>
import { reactive, toRefs, onBeforeUnmount } from '@vue/composition-api'
import { getDetailList, migrationById } from 'services/system/migration'
import { getStatus } from './configs'
import { Message } from 'element-ui'

const columns = [
  {
    label: '任务名称',
    prop: 'name'
  },
  {
    label: '执行状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '任务进度',
    prop: 'percent',
    scopedSlots: { customRender: 'percent' }
  },
  {
    label: '执行结果',
    prop: 'result'
  },
  {
    label: '开始时间',
    prop: 'startTime'
  },
  {
    label: '结束时间',
    prop: 'endTime'
  },
  {
    label: '任务耗时(ms)',
    prop: 'used'
  },
  {
    label: '操作',
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
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
export default {
  props: {
    detail: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      loading: false,
      interNum: 0,
      columns,
      searchConfigs
    })

    const getList = async function () {
      state.loading = true
      const res = await getDetailList(props.detail.id, state.params)
      if (res.success) {
        state.list = res.data.rows
        state.total = res.data.total
      }
      state.loading = false
    }

    getList()

    const refresh = function () {
      state.interNum = setInterval(() => {
        getList()
      }, 5000)
    }

    refresh()

    const goBack = function () {
      emit('goBack')
    }

    onBeforeUnmount(() => {
      clearInterval(state.interNum)
    })

    const refreshItem = async function (recordId, taskId) {
      state.loading = true
      const res = await migrationById(recordId, taskId)
      if (res.success) {
        Message.success(res.message)
      }
      state.loading = false
    }

    const getProgress = function (row) {
      return row.percent
    }

    const getProgressDetail = function ({ totalCnt = 0, completeCnt = 0 }) {
      return ((completeCnt / totalCnt) * 100).toFixed(1) - 0
    }

    return {
      ...toRefs(state),
      getList,
      goBack,
      getStatus,
      getProgress,
      refreshItem,
      getProgressDetail
    }
  }
}
</script>

<style></style>
