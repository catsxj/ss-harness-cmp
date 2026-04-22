import { taskExeOptions as exeOpt } from '@/common/commonData'
import { getTenant } from 'services/system/tenant'

const objToArr = (obj: any) => {
  const arr = []
  for (const a in obj) {
    arr.push({
      id: a,
      name: obj[a]
    })
  }
  return arr
}
export const taskExeOptions = exeOpt;
export const columns = [
  { label: '任务名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '启动人', prop: 'operator' },
  { label: '任务状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '开始时间', prop: 'gmtStart', minWidth: '110px' },
  { label: '结束时间', prop: 'gmtFinish', minWidth: '110px' },
  { label: '启动方式', prop: 'executeMode', scopedSlots: { customRender: 'executeMode' } },
  { label: '总耗时（s）', prop: 'cost' },
  { label: '所属租户', prop: 'tenantName' },
  { label: '操作', disabled: true, width: '255px', scopedSlots: { customRender: 'operate' } }
]
export const executeModeOptions = {
  WEB: '页面执行',
  API: 'API调用',
  CRON: '定时执行'
}
export const searchConfigs = [
  {
    label: '任务名称',
    value: 'name',
    type: 'Input'
  },
  {
    label: '任务状态',
    value: 'status',
    type: 'Select',
    data: objToArr(taskExeOptions)
  },
  {
    label: '执行',
    value: 'gmtStart',
    type: 'DateRange'
  },
  {
    label: '启动任务',
    value: 'executeMode',
    type: 'Select',
    data: objToArr(executeModeOptions)
  },
  {
    label: '所属租户',
    value: 'tenantId',
    type: 'Select',
    data: [],
    service: {
      api: getTenant,
      params: { simple: true },
      attr: 'data.rows'
    }
  }
]
