export const getStatus = function (type, value) {
  const colorMap = {
    SUCCEED: 'success',
    FAILED: 'danger',
    RUNNING: 'normal',
    WAITING: 'warning',
    INTERRUPTED: 'primary'
  }
  const textMap = {
    SUCCEED: '执行成功',
    FAILED: '执行失败',
    RUNNING: '正在执行',
    WAITING: '等待执行',
    INTERRUPTED: '打断执行'
  }
  return type === 'color' ? colorMap[value] : textMap[value]
}

export const columns = [
  {
    label: '迁移记录id',
    prop: 'id',
    scopedSlots: { customRender: 'id' }
  },
  {
    label: '总任务数',
    prop: 'total'
  },
  {
    label: '已完成任务数',
    prop: 'completeCnt'
  },
  {
    label: '任务进度',
    prop: 'percent',
    scopedSlots: { customRender: 'percent' }
  },
  {
    label: '执行状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '执行结果',
    prop: 'result'
  },
  {
    label: '执行人',
    prop: 'creator'
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
  }
]
