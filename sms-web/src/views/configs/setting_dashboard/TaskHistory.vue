<template>
  <AdvanceTable height="230" :card-border="false" :border="false" :show-tools="false" :data="itemData.data.rows" :columns="historyColumns">
    <template #status="{ val: status, record }">
      <status-icon :type="taskExeStatusFilter(status, 'color')">
        {{ taskExeStatusFilter(status) }}
      </status-icon>
    </template>
    <template #pagination><div></div></template>
  </AdvanceTable>
</template>
<script setup lang="ts">
const historyColumns = [
  // TODO: i18n
  { label: '任务名称', prop: 'name' },
  // TODO: i18n
  { label: '执行人', prop: 'operator' },
  // TODO: i18n
  { label: '总耗时（s）', prop: 'cost' },
  // TODO: i18n
  { label: '执行时间', prop: 'gmtStart' },
  // TODO: i18n
  { label: '任务状态', prop: 'status', scopedSlots: { customRender: 'status' } }
]

// 任务执行状态
function taskExeStatusFilter(value: string, type = 'name'): string | undefined {
  // TODO: i18n
  const obj: Record<string, { name: string; color: string }> = {
    CREATED: { name: '未执行', color: 'normal' },
    NOREADY: { name: '已跳过', color: 'warning' },
    READY: { name: '准备中', color: 'normal' },
    WAITTING: { name: '等待执行', color: 'primary' },
    CANCELING: { name: '取消中', color: 'primary' },
    RUNNING: { name: '正在执行', color: 'normal' },
    SUCCESS: { name: '执行成功', color: 'success' },
    SUSPENDED: { name: '已暂停', color: 'warning' },
    FAILED: { name: '执行失败', color: 'danger' },
    CANCELED: { name: '手动结束', color: 'warning' },
    EXCEPTION: { name: '执行异常', color: 'danger' }
  }
  return obj[value] && (obj[value] as any)[type]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineProps<{
  itemData: { data: { rows?: any[] }; config?: any }
}>()
</script>
