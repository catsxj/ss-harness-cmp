<template>
  <AdvanceTable height="230" :card-border="false" :border="false" :show-tools="false" :data="itemData.data.rows" :columns="historyColumns">
    <template #status="status">
      <status-icon :type="taskExeStatusFilter(status, 'color')">
        {{ taskExeStatusFilter(status) }}
      </status-icon>
    </template>
    <div slot="pagination"></div>
  </AdvanceTable>
</template>
<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
const historyColumns = [
  { label: '任务名称', prop: 'name' },
  { label: '执行人', prop: 'operator' },
  { label: '总耗时（s）', prop: 'cost' },
  { label: '执行时间', prop: 'gmtStart' },
  { label: '任务状态', prop: 'status', scopedSlots: { customRender: 'status' } }
]
// 任务执行状态
function taskExeStatusFilter(value: string, type = 'name') {
  const obj: any = {
    CREATED: {
      name: '未执行',
      color: 'normal'
    },
    NOREADY: {
      name: '已跳过',
      color: 'warning'
    },
    READY: {
      name: '准备中',
      color: 'normal'
    },
    WAITTING: {
      name: '等待执行',
      color: 'primary'
    },
    CANCELING: {
      name: '取消中',
      color: 'primary'
    },
    RUNNING: {
      name: '正在执行',
      color: 'normal'
    },
    SUCCESS: {
      name: '执行成功',
      color: 'success'
    },
    SUSPENDED: {
      name: '已暂停',
      color: 'warning'
    },
    FAILED: {
      name: '执行失败',
      color: 'danger'
    },
    CANCELED: {
      name: '手动结束',
      color: 'warning'
    },
    EXCEPTION: {
      name: '执行异常',
      color: 'danger'
    }
  }
  return obj[value] && obj[value][type] // 容错处理（初始化值不存在）
}

export default defineComponent({
  props: {
    itemData: {
      type: Object as PropType<{ config: any }>,
      required: true
    }
  },
  setup() {
    return {
      taskExeStatusFilter,
      historyColumns
    }
  }
})
</script>
