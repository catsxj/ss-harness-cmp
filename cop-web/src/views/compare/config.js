export const standardColumns = [
  { label: '任务编号', prop: 'taskName', scopedSlots: { customRender: 'taskName' } },
  { label: '任务名称', prop: 'remark' },
  { label: '主机', prop: 'agentIP1', scopedSlots: { customRender: 'agentIP1' } },
  { label: '对比文件目录', prop: 'filePath1' },
  { label: '本地标准文件', prop: 'standardFileName' },
  { label: '创建人', prop: 'createUser' },
  { label: '对比周期', prop: 'startTime', scopedSlots: { customRender: 'startTime' } },
  { label: '状态', prop: 'runstatus', scopedSlots: { customRender: 'runstatus' } },
  { label: '操作', disabled: true, width: '250px', scopedSlots: { customRender: 'operate' } }
]

export const historyColumns = [
  { label: '任务编号', prop: 'taskName', scopedSlots: { customRender: 'taskName' } },
  { label: '任务名称', prop: 'remark' },
  { label: '主机', prop: 'agentIP1', scopedSlots: { customRender: 'agentIP1' } },
  { label: '对比文件目录', prop: 'filePath1' },
  { label: '创建人', prop: 'createUser' },
  { label: '对比周期', prop: 'startTime', scopedSlots: { customRender: 'startTime' } },
  { label: '状态', prop: 'runstatus', scopedSlots: { customRender: 'runstatus' } },
  { label: '操作', disabled: true, width: '250px', scopedSlots: { customRender: 'operate' } }
]

export const acrossColumns = [
  { label: '任务编号', prop: 'taskName', scopedSlots: { customRender: 'taskName' } },
  { label: '任务名称', prop: 'remark' },
  { label: '对比文件目录', prop: 'filePath1' },
  { label: '创建人', prop: 'createUser' },
  { label: '对比周期', prop: 'startTime', scopedSlots: { customRender: 'startTime' } },
  { label: '状态', prop: 'runstatus', scopedSlots: { customRender: 'runstatus' } },
  { label: '操作', disabled: true, width: '250px', scopedSlots: { customRender: 'operate' } }
]

export const viewColumns = [
  { label: '任务编号', prop: 'taskName' },
  { label: '任务名称', prop: 'remark' },
  { label: '任务类型', prop: 'taskType', scopedSlots: { customRender: 'taskName' } },
  { label: '对比文件1', prop: 'filePath1' },
  { label: '对比文件2', prop: 'filePath2' },
  { label: '创建人', prop: 'createUser' },
  { label: 'MD5', prop: 'mD5', scopedSlots: { customRender: 'mD5' } }
]

export const whiteListColumns = [
  { label: '内容', prop: 'wList' },
  { label: '创建时间', prop: 'createTime' },
  { label: '创建人', prop: 'createrName' },
  { label: '操作', disabled: true, width: '150px', scopedSlots: { customRender: 'operate' } }
]

export const standardFileColumns = [
  { label: '文件名称', prop: 'fileName' },
  { label: '文件路径', prop: 'filePath' },
  { label: '创建时间', prop: 'createTime' },
  { label: '创建人', prop: 'createrName' },
  { label: '操作', disabled: true, width: '150px', scopedSlots: { customRender: 'operate' } }
]

export const searchConfigs = [
  {
    label: '任务编号',
    value: 'taskName',
    type: 'Input'
  }
]

export const whiteListConfigs = [
  {
    label: '内容',
    value: 'wList',
    type: 'Input'
  }
]

export const viewSearchConfigs = [
  {
    label: '任务编号',
    value: 'taskName',
    type: 'Input'
  },
  {
    label: '任务类型',
    value: 'taskType',
    type: 'Select',
    sign: 'LK',
    data: [
      { id: 8, name: '标准对比' },
      { id: 11, name: '历史对比' },
      { id: 9, name: '跨机对比' }
    ]
  }
]

export const standardFileSearchConfigs = [
  {
    label: '文件名称',
    value: 'fileName',
    type: 'Input'
  },
  {
    label: '创建人',
    value: 'creator',
    type: 'Input'
  },
  { label: '', value: 'startDate', type: 'DateRange' }
]
