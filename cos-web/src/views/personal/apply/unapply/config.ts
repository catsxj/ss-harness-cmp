import { getTenant, getUser } from 'services/system/tenant'
import { getProject } from 'services/system/project'
import store from '@/store'
export const columns = [
  {
    label: '编号',
    prop: 'instanceNo',
    scopedSlots: { customRender: 'instanceNo' }
  },
  {
    label: '类型',
    prop: 'applyCategory',
    scopedSlots: { customRender: 'applyCategory' }
  },
  {
    label: '标题',
    prop: 'name'
  },
  {
    label: '发起人',
    prop: 'creatorName'
  },
  {
    label: store.getters.systemConfig.projectConfigLabel,
    prop: 'projectName'
  },
  {
    label: '用户',
    prop: 'creatorName'
  },
  {
    label: '发起时间',
    prop: 'gmtCreate'
  },
  {
    label: '等待时长',
    prop: 'duration'
  },
  {
    label: '当前审批人',
    prop: 'currentAuditors'
  },
  {
    label: '状态',
    prop: 'instanceState',
    scopedSlots: { customRender: 'instanceState' }
  },
  {
    label: '操作',
    prop: 'id',
    width: '160px',
    disabled: true,
    scopedSlots: { customRender: 'operate' }
  }
]
export const searchConfigs = [
  {
    type: 'Select',
    label: '工单类型',
    value: 'applyCategory',
    data: [
      { name: '服务使用申请', id: 'EFCApplicationOperate' },
      { name: '服务实例变更', id: 'EFCAlterationOperate' },
      { name: '服务实例延期', id: 'EFCExtensionOperate' },
      { name: '服务快照申请', id: 'EFCSnapshotApplicationOperate' },
      { name: '服务实例退订', id: 'BacthUnsubscribeOperate' }
    ]
  },
  { type: 'Input', label: '标题', value: 'name' },
  { type: 'Input', label: '申请单号', value: 'instanceNo' },
  {
    type: 'Select',
    value: 'projectId',
    label: store.getters.systemConfig.projectConfigLabel,
    props: { value: 'id', label: 'name' },
    data: [],
    service: {
      api: getProject,
      params: {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { queryAsManager: true }, sign: 'EQ' }])
      },
      attr: 'data.rows'
    }
  },
  {
    type: 'Select',
    value: 'creatorId',
    label: '所属用户',
    data: [],
    service: {
      api: getUser,
      params: {
        simple: true
      },
      attr: 'data.rows'
    }
  },
  { type: 'DateRange', label: '发起时间', value: 'gmtCreate' }
  // {
  //   type: 'Select',
  //   label: '类型',
  //   value: 'applyCategory',
  //   data: applyTypeList
  // }
]
